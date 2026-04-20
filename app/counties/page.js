import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import CountiesSearch from './search'

export default async function CountiesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: counties } = await supabase
    .from('public_budgets')
    .select('*')
    .order('county_name', { ascending: true })

  const byState = {}
  for (const c of counties || []) {
    if (!byState[c.state]) byState[c.state] = []
    byState[c.state].push(c)
  }

  const total = (counties || []).length
  const stateCount = Object.keys(byState).length

  return (
    <div style={{minHeight:'100vh',background:'#f8f6f1'}}>
      <nav style={{borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8f6f1',position:'sticky',top:0,zIndex:50}}>
        <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'18px',color:'#1a1a2e',textDecoration:'none'}}>
          County<span style={{color:'#2e7d5e'}}>Purse</span>
        </Link>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/pricing" style={{fontSize:'14px',color:'#4b5563',textDecoration:'none'}}>Pricing</Link>
          <Link href="/login" style={{fontSize:'14px',color:'#4b5563',textDecoration:'none'}}>Sign in</Link>
          <Link href="/signup" style={{fontSize:'14px',background:'#1a1a2e',color:'#f8f6f1',padding:'8px 16px',borderRadius:'6px',textDecoration:'none'}}>Get started</Link>
        </div>
      </nav>

      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'60px 24px'}}>
        <div style={{marginBottom:'48px'}}>
          <div style={{fontSize:'12px',fontFamily:'monospace',color:'#2e7d5e',border:'1px solid #2e7d5e',background:'#f0f7f4',padding:'4px 12px',borderRadius:'4px',display:'inline-block',marginBottom:'16px',letterSpacing:'2px'}}>
            PUBLIC BUDGET DATABASE
          </div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'40px',color:'#1a1a2e',marginBottom:'12px'}}>County Budget Database</h1>
          <p style={{color:'#6b7280',fontSize:'16px',lineHeight:1.6,maxWidth:'600px',marginBottom:'32px'}}>
            Browse publicly available budget data for US counties. All data sourced from official government websites and parsed by AI.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'32px'}}>
            {[
              { label: 'Counties tracked', value: total.toString() },
              { label: 'States covered', value: stateCount.toString() },
              { label: 'Updated', value: 'Monthly' },
            ].map(s => (
              <div key={s.label} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
                <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>{s.label}</p>
                <p style={{fontFamily:'Georgia,serif',fontSize:'24px',color:'#1a1a2e'}}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <CountiesSearch counties={counties || []} />

        <div style={{padding:'32px',background:'#1a1a2e',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'48px'}}>
          <div>
            <h3 style={{fontFamily:'Georgia,serif',color:'#f8f6f1',fontSize:'20px',marginBottom:'8px'}}>Is your county missing?</h3>
            <p style={{color:'#6b7280',fontSize:'14px'}}>Sign up and ingest your county budget in minutes.</p>
          </div>
          <Link href="/signup" style={{background:'#2e7d5e',color:'white',padding:'12px 24px',borderRadius:'8px',textDecoration:'none',fontWeight:'500',fontSize:'14px',whiteSpace:'nowrap'}}>
            Add your county
          </Link>
        </div>

        <p style={{textAlign:'center',marginTop:'32px',fontSize:'12px',color:'#9ca3af'}}>
          Powered by <strong style={{color:'#1a1a2e'}}>AMILLI AI, CORP</strong> · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
