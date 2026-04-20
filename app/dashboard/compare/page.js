import { createServerSupabase } from '@/lib/supabase-server'
import CompareClient from './client'

export default async function ComparePage() {
  const supabase = await createServerSupabase()
  const { data: counties } = await supabase
    .from('public_budgets')
    .select('id, county_name, state, total_amount, parsed_data')
    .order('state', { ascending: true })

  return (
    <div style={{padding:'32px'}}>
      <h1 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e',marginBottom:'4px'}}>County Comparison</h1>
      <p style={{color:'#9ca3af',fontSize:'14px',marginBottom:'32px'}}>Compare spending across multiple counties side by side</p>
      <CompareClient counties={counties || []} />
    </div>
  )
}
