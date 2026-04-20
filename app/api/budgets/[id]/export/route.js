import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(req, { params: paramsPromise }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = await paramsPromise
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') || 'csv'

  const { data: budget } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!budget) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = budget.parsed_data || {}
  const departments = parsed.departments || []

  if (format === 'json') {
    return new NextResponse(JSON.stringify({
      title: budget.title,
      county: budget.county_name,
      fiscalYear: budget.fiscal_year,
      totalAmount: budget.total_amount,
      summary: parsed.summary,
      departments,
      flags: parsed.flags || [],
      exportedAt: new Date().toISOString()
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${budget.county_name || 'budget'}-${budget.fiscal_year || 'fy'}.json"`
      }
    })
  }

  const rows = [
    ['CountyPurse Budget Export'],
    ['Title', budget.title || ''],
    ['County', budget.county_name || ''],
    ['Fiscal Year', budget.fiscal_year || ''],
    ['Total Amount', budget.total_amount || ''],
    ['Exported', new Date().toLocaleDateString()],
    [],
    ['Summary'],
    [parsed.summary || ''],
    [],
    ['Department', 'Amount', 'Percent of Total'],
    ...departments.map(d => [d.name, d.amount || '', d.percentOfTotal ? d.percentOfTotal + '%' : '']),
    [],
    ['Flags'],
    ...(parsed.flags || []).map(f => [f])
  ]

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${budget.county_name || 'budget'}-${budget.fiscal_year || 'fy'}.csv"`
    }
  })
}
