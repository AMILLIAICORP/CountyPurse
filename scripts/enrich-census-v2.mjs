import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const CENSUS_KEY = process.env.CENSUS_API_KEY

const STATE_FIPS = {
  'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05',
  'California': '06', 'Colorado': '08', 'Connecticut': '09', 'Delaware': '10',
  'Florida': '12', 'Georgia': '13', 'Hawaii': '15', 'Idaho': '16',
  'Illinois': '17', 'Indiana': '18', 'Iowa': '19', 'Kansas': '20',
  'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
  'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28',
  'Missouri': '29', 'Montana': '30', 'Nebraska': '31', 'Nevada': '32',
  'New Hampshire': '33', 'New Jersey': '34', 'New Mexico': '35', 'New York': '36',
  'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39', 'Oklahoma': '40',
  'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
  'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49',
  'Vermont': '50', 'Virginia': '51', 'Washington': '53', 'West Virginia': '54',
  'Wisconsin': '55', 'Wyoming': '56'
}

// Get county FIPS and population from ACS
async function getCountyInfo(stateFips, countyName) {
  try {
    const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E,B19013_001E,B25077_001E&for=county:*&in=state:${stateFips}&key=${CENSUS_KEY}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const headers = data[0]
    const nameIdx = headers.indexOf('NAME')
    const popIdx = headers.indexOf('B01003_001E')
    const incomeIdx = headers.indexOf('B19013_001E')
    const homeValueIdx = headers.indexOf('B25077_001E')
    const countyIdx = headers.indexOf('county')

    const match = data.slice(1).find(row => {
      const name = row[nameIdx].toLowerCase()
      const search = countyName.toLowerCase()
      return name.includes(search)
    })

    if (!match) return null

    return {
      population: parseInt(match[popIdx]) || null,
      medianIncome: parseInt(match[incomeIdx]) || null,
      medianHomeValue: parseInt(match[homeValueIdx]) || null,
      countyFips: match[countyIdx],
      stateFips,
      name: match[nameIdx]
    }
  } catch (err) {
    return null
  }
}

// Get government finances from Census timeseries
async function getCountyFinances(stateFips, countyFips) {
  try {
    // Try the Annual Survey of Local Government Finances
    const url = `https://api.census.gov/data/timeseries/govs?get=NAME,GOVTYPE,EXPENDTYPE,AMOUNT&GOVTYPE=2&for=county:${countyFips}&in=state:${stateFips}&time=2021&key=${CENSUS_KEY}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data || data.length < 2) return null

    const headers = data[0]
    const amountIdx = headers.indexOf('AMOUNT')
    const exptypeIdx = headers.indexOf('EXPENDTYPE')

    let totalExpenditure = 0
    let education = 0
    let health = 0
    let police = 0
    let fire = 0
    let highways = 0

    for (const row of data.slice(1)) {
      const amount = parseInt(row[amountIdx]) * 1000 || 0
      const exptype = row[exptypeIdx]
      if (exptype === '0') totalExpenditure += amount
      if (exptype === 'E') education += amount
      if (exptype === 'G') health += amount
      if (exptype === 'PF') police += amount
      if (exptype === 'LB') fire += amount
      if (exptype === 'HW') highways += amount
    }

    return { totalExpenditure, education, health, police, fire, highways }
  } catch (err) {
    return null
  }
}

async function main() {
  console.log('CountyPurse — Census Data Enrichment v2')
  const { data: counties } = await supabase
    .from('public_budgets')
    .select('*')
    .order('state', { ascending: true })

  console.log(`Processing ${counties.length} counties...\n`)

  let enriched = 0
  let failed = 0

  for (const county of counties) {
    const stateFips = STATE_FIPS[county.state]
    if (!stateFips) { failed++; continue }

    process.stdout.write(`${county.county_name}, ${county.state}... `)

    const info = await getCountyInfo(stateFips, county.county_name)
    if (!info) {
      console.log('not found')
      failed++
      await new Promise(r => setTimeout(r, 300))
      continue
    }

    const finances = await getCountyFinances(stateFips, info.countyFips)
    const existing = county.parsed_data || {}

    const deps = []
    if (finances) {
      const total = finances.totalExpenditure
      if (finances.education) deps.push({ name: 'Education', amount: finances.education, percentOfTotal: total ? ((finances.education/total)*100).toFixed(1) : null })
      if (finances.health) deps.push({ name: 'Health & Human Services', amount: finances.health, percentOfTotal: total ? ((finances.health/total)*100).toFixed(1) : null })
      if (finances.police) deps.push({ name: 'Police Protection', amount: finances.police, percentOfTotal: total ? ((finances.police/total)*100).toFixed(1) : null })
      if (finances.fire) deps.push({ name: 'Fire Protection', amount: finances.fire, percentOfTotal: total ? ((finances.fire/total)*100).toFixed(1) : null })
      if (finances.highways) deps.push({ name: 'Highways & Transportation', amount: finances.highways, percentOfTotal: total ? ((finances.highways/total)*100).toFixed(1) : null })
    }

    const totalBudget = finances?.totalExpenditure || county.total_amount || existing.totalAmount

    const enrichedData = {
      ...existing,
      countyName: county.county_name,
      state: county.state,
      population: info.population,
      medianHouseholdIncome: info.medianIncome,
      medianHomeValue: info.medianHomeValue,
      censusName: info.name,
      totalRevenue: existing.totalRevenue || null,
      departments: deps.length > 0 ? deps : (existing.departments || []),
      fiscalYear: existing.fiscalYear || '2021',
      summary: totalBudget ?
        `${county.county_name} County, ${county.state} had a population of ${info.population?.toLocaleString()} with a total budget of $${(totalBudget/1000000).toFixed(1)}M. Median household income: $${info.medianIncome?.toLocaleString()}. Data sourced from US Census Bureau (2021-2022).` :
        `${county.county_name} County, ${county.state} had a population of ${info.population?.toLocaleString()} as of 2022. Median household income: $${info.medianIncome?.toLocaleString()}. Median home value: $${info.medianHomeValue?.toLocaleString()}.`
    }

    const { error } = await supabase
      .from('public_budgets')
      .update({
        total_amount: totalBudget || county.total_amount,
        parsed_data: enrichedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', county.id)

    if (error) {
      console.log('update failed')
      failed++
    } else {
      console.log(`pop: ${info.population?.toLocaleString()} · income: $${info.medianIncome?.toLocaleString()}`)
      enriched++
    }

    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\nDone! Enriched: ${enriched} · Failed: ${failed}`)
}

main().catch(console.error)
