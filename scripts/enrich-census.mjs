import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const CENSUS_KEY = process.env.CENSUS_API_KEY

// Census Bureau Annual Survey of State and Local Government Finances
// Variable codes:
// TCREV — Total Revenue
// TCEXP — Total Expenditure  
// EDUC — Education spending
// HLTH — Health spending
// POLIC — Police protection
// FIRE — Fire protection
// HWY — Highways spending
// WELH — Public welfare

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

async function fetchCensusData(stateFips, countyName) {
  try {
    // Use Census Population and Housing data as a starting point
    // and Government Finance data for budget numbers
    const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E&for=county:*&in=state:${stateFips}&key=${CENSUS_KEY}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Census API error: ' + res.status)
    const data = await res.json()
    
    // Find matching county
    const headers = data[0]
    const nameIdx = headers.indexOf('NAME')
    const popIdx = headers.indexOf('B01003_001E')
    
    const match = data.slice(1).find(row => {
      const name = row[nameIdx].toLowerCase()
      const search = countyName.toLowerCase()
      return name.includes(search)
    })
    
    if (!match) return null
    
    return {
      population: parseInt(match[popIdx]) || null,
      countyFips: match[match.length - 1],
      stateFips: stateFips,
      name: match[nameIdx]
    }
  } catch (err) {
    return null
  }
}

async function fetchCountyFinances(stateFips, countyFips) {
  try {
    // Census Annual Survey of Government Finances
    const url = `https://api.census.gov/data/2021/govs/local?get=NAME,TCREV,TCEXP,EDUC01,HLTH04,POLIC,FIRE,HWY&for=county:${countyFips}&in=state:${stateFips}&key=${CENSUS_KEY}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.length < 2) return null
    
    const headers = data[0]
    const row = data[1]
    
    const get = (key) => {
      const idx = headers.indexOf(key)
      return idx >= 0 ? parseInt(row[idx]) * 1000 || null : null // Census reports in thousands
    }
    
    return {
      totalRevenue: get('TCREV'),
      totalExpenditure: get('TCEXP'),
      education: get('EDUC01'),
      health: get('HLTH04'),
      police: get('POLIC'),
      fire: get('FIRE'),
      highways: get('HWY')
    }
  } catch (err) {
    return null
  }
}

async function main() {
  console.log('CountyPurse — Census Data Enrichment')
  console.log('Fetching counties from database...')
  
  const { data: counties, error } = await supabase
    .from('public_budgets')
    .select('*')
    .order('state', { ascending: true })
  
  if (error) { console.error('Supabase error:', error); return }
  
  console.log(`Found ${counties.length} counties to enrich\n`)
  
  let enriched = 0
  let failed = 0
  
  for (const county of counties) {
    const stateFips = STATE_FIPS[county.state]
    if (!stateFips) {
      console.log(`⚠ No FIPS for ${county.state} — skipping`)
      failed++
      continue
    }
    
    process.stdout.write(`Processing ${county.county_name}, ${county.state}... `)
    
    // Get county FIPS from Census
    const censusInfo = await fetchCensusData(stateFips, county.county_name)
    if (!censusInfo) {
      console.log('not found in Census')
      failed++
      await new Promise(r => setTimeout(r, 500))
      continue
    }
    
    // Get financial data
    const finances = await fetchCountyFinances(stateFips, censusInfo.countyFips)
    
    // Build enriched parsed_data
    const existingData = county.parsed_data || {}
    const enrichedData = {
      ...existingData,
      countyName: county.county_name,
      state: county.state,
      population: censusInfo.population,
      censusName: censusInfo.name,
      departments: finances ? [
        finances.education && { name: 'Education', amount: finances.education, percentOfTotal: finances.totalExpenditure ? ((finances.education / finances.totalExpenditure) * 100).toFixed(1) : null },
        finances.health && { name: 'Health & Human Services', amount: finances.health, percentOfTotal: finances.totalExpenditure ? ((finances.health / finances.totalExpenditure) * 100).toFixed(1) : null },
        finances.police && { name: 'Police Protection', amount: finances.police, percentOfTotal: finances.totalExpenditure ? ((finances.police / finances.totalExpenditure) * 100).toFixed(1) : null },
        finances.fire && { name: 'Fire Protection', amount: finances.fire, percentOfTotal: finances.totalExpenditure ? ((finances.fire / finances.totalExpenditure) * 100).toFixed(1) : null },
        finances.highways && { name: 'Highways & Transportation', amount: finances.highways, percentOfTotal: finances.totalExpenditure ? ((finances.highways / finances.totalExpenditure) * 100).toFixed(1) : null },
      ].filter(Boolean) : (existingData.departments || []),
      totalRevenue: finances?.totalRevenue,
      summary: finances ? 
        `${county.county_name} County, ${county.state} reported total revenues of $${(finances.totalRevenue/1000000).toFixed(1)}M and total expenditures of $${(finances.totalExpenditure/1000000).toFixed(1)}M according to the US Census Bureau Annual Survey of Government Finances (2021). Population: ${censusInfo.population?.toLocaleString()}.` :
        existingData.summary
    }
    
    // Update Supabase
    const { error: updateError } = await supabase
      .from('public_budgets')
      .update({
        total_amount: finances?.totalExpenditure || county.total_amount,
        parsed_data: enrichedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', county.id)
    
    if (updateError) {
      console.log('update failed')
      failed++
    } else {
      const amount = finances?.totalExpenditure ? '$' + (finances.totalExpenditure/1000000).toFixed(1) + 'M' : 'no finances found'
      console.log(amount)
      enriched++
    }
    
    await new Promise(r => setTimeout(r, 1000))
  }
  
  console.log(`\nDone! Enriched: ${enriched} · Failed: ${failed}`)
}

main().catch(console.error)
