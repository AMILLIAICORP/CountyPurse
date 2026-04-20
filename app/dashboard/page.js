import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
  const { count: totalBudgets } = await supabase.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const totalTracked = (budgets||[]).reduce((s,b)=>s+(b.total_amount||0),0)
  const fmt = n => n>=1000000?`$${(n/1000000).toFixed(1)}M`:`$${n.toLocaleString()}`
  return (
    <div style={{padding:'32px'}}>
      <h1 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e',marginBottom:'4px'}}>Overview</h1>
      <p style={{color:'#9ca3af',fontSize:'14px',marginBottom:'32px'}}>Welcome back, {user.user_metadata?.name||user.email}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'32px'}}>
        {[{label:'Budgets ingested',value:(totalBudgets||0).toString()},{label:'Total funds tracked',value:totalTracked>0?fmt(totalTracked):'—'},{label:'Last ingested',value:budgets?.[0]?new Date(budgets[0].created_at).toLocaleDateString():'—'}].map(s=>(
          <div key={s.label} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px'}}>
            <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>{s.label}</p>
            <p style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e'}}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'32px'}}>
        <Link href="/ingest" style={{background:'#2e7d5e',color:'white',borderRadius:'12px',padding:'24px',textDecoration:'none',display:'block'}}>
          <div style={{fontSize:'24px',marginBottom:'12px'}}>⊕</div>
          <h3 style={{fontFamily:'Georgia,serif',fontSize:'18px',marginBottom:'4px'}}>Ingest a budget</h3>
          <p style={{fontSize:'14px',opacity:0.7}}>Paste plain-English budget text for instant analysis</p>
        </Link>
        <Link href="/dashboard/analytics" style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',textDecoration:'none',display:'block'}}>
          <div style={{fontSize:'24px',marginBottom:'12px'}}>◈</div>
          <h3 style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e',marginBottom:'4px'}}>View analytics</h3>
          <p style={{fontSize:'14px',color:'#9ca3af'}}>Spending breakdowns and department rollups</p>
        </Link>
      </div>
      {budgets?.length>0?(
        <div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#1a1a2e',marginBottom:'16px'}}>Recent budgets</h2>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',overflow:'hidden'}}>
            {budgets.map((b,i)=>(
              <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom:i<budgets.length-1?'1px solid #f3f4f6':'none'}}>
                <div><p style={{fontWeight:'500',color:'#1a1a2e',fontSize:'14px'}}>{b.title}</p><p style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>{b.county_name} · {b.fiscal_year||'FY unknown'}</p></div>
                <div style={{textAlign:'right'}}><p style={{color:'#2e7d5e',fontWeight:'500',fontSize:'14px'}}>{b.total_amount?fmt(b.total_amount):'—'}</p><p style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>{new Date(b.created_at).toLocaleDateString()}</p></div>
              </div>
            ))}
          </div>
        </div>
      ):(
        <div style={{background:'white',border:'2px dashed #e5e7eb',borderRadius:'12px',padding:'60px',textAlign:'center'}}>
          <p style={{fontFamily:'Georgia,serif',color:'#9ca3af',fontSize:'20px',marginBottom:'8px'}}>No budgets yet</p>
          <p style={{color:'#9ca3af',fontSize:'14px',marginBottom:'24px'}}>Ingest your first county budget to get started</p>
          <Link href="/ingest" style={{background:'#2e7d5e',color:'white',padding:'10px 24px',borderRadius:'8px',textDecoration:'none',fontSize:'14px',fontWeight:'500'}}>Ingest budget</Link>
        </div>
      )}
    </div>
  )
}
