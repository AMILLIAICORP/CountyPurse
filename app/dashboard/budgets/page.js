import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function BudgetsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const fmt = n => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n?.toLocaleString() || '—'}`

  return (
    <div style={{padding:'32px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px'}}>
        <div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e',marginBottom:'4px'}}>Your Budgets</h1>
          <p style={{color:'#9ca3af',fontSize:'14px'}}>{budgets?.length || 0} budgets ingested</p>
        </div>
        <Link href="/ingest" style={{background:'#2e7d5e',color:'white',padding:'10px 20px',borderRadius:'8px',textDecoration:'none',fontSize:'14px',fontWeight:'500'}}>
          + Ingest budget
        </Link>
      </div>

      {budgets?.length > 0 ? (
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f9fafb'}}>
                <th style={{padding:'12px 24px',textAlign:'left',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase'}}>Budget</th>
                <th style={{padding:'12px 24px',textAlign:'left',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase'}}>County</th>
                <th style={{padding:'12px 24px',textAlign:'left',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase'}}>Fiscal Year</th>
                <th style={{padding:'12px 24px',textAlign:'right',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase'}}>Total Amount</th>
                <th style={{padding:'12px 24px',textAlign:'right',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b, i) => (
                <tr key={b.id} style={{borderTop:'1px solid #f3f4f6'}}>
                  <td style={{padding:'16px 24px'}}>
                    <p style={{fontWeight:'500',color:'#1a1a2e',fontSize:'14px'}}>{b.title || 'Untitled'}</p>
                    <p style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>{new Date(b.created_at).toLocaleDateString()}</p>
                  </td>
                  <td style={{padding:'16px 24px',fontSize:'14px',color:'#4b5563'}}>{b.county_name || '—'}</td>
                  <td style={{padding:'16px 24px',fontSize:'14px',color:'#4b5563'}}>{b.fiscal_year || '—'}</td>
                  <td style={{padding:'16px 24px',textAlign:'right',fontSize:'14px',fontWeight:'500',color:'#2e7d5e'}}>{b.total_amount ? fmt(b.total_amount) : '—'}</td>
                  <td style={{padding:'16px 24px',textAlign:'right'}}>
                    <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
                      <Link href={`/dashboard/budgets/${b.id}`} style={{fontSize:'12px',color:'#2e7d5e',textDecoration:'none',border:'1px solid #2e7d5e',padding:'4px 12px',borderRadius:'4px'}}>View</Link>
                      <Link href={`/api/budgets/${b.id}/export`} style={{fontSize:'12px',color:'#4b5563',textDecoration:'none',border:'1px solid #e5e7eb',padding:'4px 12px',borderRadius:'4px'}}>Export CSV</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{background:'white',border:'2px dashed #e5e7eb',borderRadius:'12px',padding:'60px',textAlign:'center'}}>
          <p style={{fontFamily:'Georgia,serif',color:'#9ca3af',fontSize:'20px',marginBottom:'8px'}}>No budgets yet</p>
          <p style={{color:'#9ca3af',fontSize:'14px',marginBottom:'24px'}}>Ingest your first county budget to get started</p>
          <Link href="/ingest" style={{background:'#2e7d5e',color:'white',padding:'10px 24px',borderRadius:'8px',textDecoration:'none',fontSize:'14px',fontWeight:'500'}}>Ingest budget</Link>
        </div>
      )}
    </div>
  )
}
