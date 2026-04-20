import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const COUNTIES = [
  { name: 'Montgomery', url: 'https://www.montgomerycountymd.gov/omb/budget' },
  { name: "Prince George's", url: 'https://www.princegeorgescountymd.gov/budget' },
  { name: 'Baltimore', url: 'https://www.baltimorecountymd.gov/departments/budget' },
  { name: 'Anne Arundel', url: 'https://www.aacounty.org/departments/budget' },
  { name: 'Howard', url: 'https://www.howardcountymd.gov/finance/budget' },
  { name: 'Frederick', url: 'https://www.frederickcountymd.gov/budget' },
  { name: 'Harford', url: 'https://www.harfordcountymd.gov/budget' },
  { name: 'Carroll', url: 'https://www.carrollcountymd.gov/budget' },
]
async function processCounty(county) {
  console.log('Processing ' + county.name + ' County, MD...')
  try {
    const res = await fetch(county.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const text = await res.text()
    const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    if (stripped.length < 100) throw new Error('Not enough content')
    console.log('  Fetched ' + stripped.length + ' chars')
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: 'Parse this county budget page and return ONLY valid JSON no markdown with fields: countyName, fiscalYear, totalAmount, departments (array with name/amount/percentOfTotal/subcategories), summary, flags. Page content: ' + stripped.slice(0, 12000) }],
    })
    const responseText = message.content.filter(b => b.type === 'text').map(b => b.text).join('')
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    console.log('  Parsed — ' + (parsed.totalAmount ? '$' + (parsed.totalAmount/1000000).toFixed(1) + 'M' : 'amount unknown'))
    await supabase.from('public_budgets').upsert({
      state: 'Maryland',
      county_name: county.name,
      fiscal_year: parsed.fiscalYear,
      total_amount: parsed.totalAmount,
      parsed_data: parsed,
      source_url: county.url,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'state,county_name,fiscal_year' })
    console.log('  Saved to Supabase')
  } catch (err) {
    console.log('  Failed: ' + err.message)
  }
}
async function main() {
  console.log('CountyPurse — Maryland Budget Scraper')
  console.log('Processing ' + COUNTIES.length + ' counties...')
  for (const county of COUNTIES) {
    await processCounty(county)
    await new Promise(r => setTimeout(r, 2000))
  }
  console.log('Done!')
}
main().catch(console.error)
