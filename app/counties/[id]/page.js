import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CountyPage({ params: paramsPromise }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const params = await paramsPromise

  const { data: county } = await supabase
    .from('public_budgets')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!county) notFound()

  const parsed = county.parsed_data || {}
  const departments = parsed.departments || []
  const totalAmount = county.total_amount || parsed.totalAmount || parsed.totalExpenditure
  const population = parsed.population
  const totalRevenue = parsed.totalRevenue

  function fmt(n) {
    if (!n) return 'N/A'
    if (n >= 1000000000) return '$' + (n / 1000000000).toFixed(1) + 'B'
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K'
    return '$' + n.toLocaleString()
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8f6f1'}}>
      <nav style={{borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8f6f1',position:'sticky',top:0,zIndex:50}}>
        <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'18px',color:'#1a1a2e',textDecoration:'none'}}>
          County<span style={{color:'#2e7d5e'}}>Purse</span>
        </Link>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/counties" style={{fontSize:'14px',color:'#4b5563',textDecoration:'none'}}>← All counties</Link>
          <Link href="/signup" style={{fontSize:'14px',background:'#1a1a2e',color:'#f8f6f1',padding:'8px 16px',borderRadius:'6px',textDecoration:'none'}}>Get started</Link>
        </div>
      </nav>

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'60px 24px'}}>
        <div style={{marginBottom:'12px'}}>
          <Link href="/counties" style={{fontSize:'13px',color:'#6b7280',textDecoration:'none'}}>← County Database</Link>
        </div>

        <div style={{marginBottom:'40px'}}>
          <div style={{fontSize:'12px',fontFamily:'monospace',color:'#2e7d5e',border:'1px solid #2e7d5e',background:'#f0f7f4',padding:'4px 12px',borderRadius:'4px',display:'inline-block',marginBottom:'16px',letterSpacing:'2px'}}>
            {county.state.toUpperCase()}
          </div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'40px',color:'#1a1a2e',marginBottom:'8px'}}>
            {county.county_name} County
          </h1>
          <p style={{color:'#6b7280',fontSize:'15px'}}>
            {parsed.fiscalYear ? `Fiscal Year ${parsed.fiscalYear}` : 'Budget Data'} · {county.state}
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'40px'}}>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
            <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Total Budget</p>
            <p style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e'}}>{fmt(totalAmount)}</p>
          </div>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
            <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Total Revenue</p>
            <p style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e'}}>{fmt(totalRevenue)}</p>
          </div>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
            <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Population</p>
            <p style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e'}}>{population ? population.toLocaleString() : 'N/A'}</p>
          </div>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
            <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Departments</p>
            <p style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e'}}>{departments.length || 'N/A'}</p>
          </div>
        </div>

        {parsed.summary && (
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#1a1a2e',marginBottom:'12px'}}>Summary</h2>
            <p style={{color:'#4b5563',lineHeight:1.7,fontSize:'15px'}}>{parsed.summary}</p>
          </div>
        )}

        {departments.length > 0 && (
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#1a1a2e',marginBottom:'20px'}}>Department Breakdown</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {departments.map((dept, i) => (
                <div key={i}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                    <p style={{fontWeight:'600',color:'#1a1a2e',fontSize:'14px'}}>{dept.name}</p>
                    <p style={{fontFamily:'monospace',fontWeight:'700',color:'#2e7d5e',fontSize:'14px'}}>
                      {dept.amount ? fmt(dept.amount) : 'N/A'}
                    </p>
                  </div>
                  {dept.percentOfTotal && (
                    <div style={{background:'#e5e7eb',borderRadius:'999px',height:'6px',overflow:'hidden'}}>
                      <div style={{background:'#2e7d5e',height:'100%',width:Math.min(parseFloat(dept.percentOfTotal),100)+'%',borderRadius:'999px'}}></div>
                    </div>
                  )}
                  {dept.percentOfTotal && <p style={{fontSize:'11px',color:'#9ca3af',marginTop:'4px'}}>{dept.percentOfTotal}% of total budget</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {parsed.flags && parsed.flags.length > 0 && (
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#1a1a2e',marginBottom:'12px'}}>Flags & Notes</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {parsed.flags.map((flag, i) => (
                <div key={i} style={{display:'flex',gap:'10px',padding:'10px',background:'#fef3c7',borderRadius:'6px',fontSize:'14px',color:'#92400e'}}>
                  <span>⚠</span><span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#1a1a2e',marginBottom:'12px'}}>Data Sources</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            <div style={{display:'flex',gap:'10px',fontSize:'14px',color:'#4b5563'}}>
              <span>📊</span><span>US Census Bureau Annual Survey of Government Finances (2021)</span>
            </div>
            <div style={{display:'flex',gap:'10px',fontSize:'14px',color:'#4b5563'}}>
              <span>👥</span><span>US Census Bureau American Community Survey 5-Year Estimates (2022)</span>
            </div>
            {county.source_url && (
              <div style={{display:'flex',gap:'10px',fontSize:'14px',color:'#4b5563'}}>
                <span>🌐</span><a href={county.source_url} target="_blank" rel="noopener noreferrer" style={{color:'#2e7d5e',wordBreak:'break-all'}}>{county.source_url}</a>
              </div>
            )}
          </div>
        </div>

        <div style={{padding:'32px',background:'#1a1a2e',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'32px'}}>
          <div>
            <h3 style={{fontFamily:'Georgia,serif',color:'#f8f6f1',fontSize:'20px',marginBottom:'8px'}}>Want deeper analysis?</h3>
            <p style={{color:'#6b7280',fontSize:'14px'}}>Sign up to upload and analyze your own budget documents.</p>
          </div>
          <Link href="/signup" style={{background:'#2e7d5e',color:'white',padding:'12px 24px',borderRadius:'8px',textDecoration:'none',fontWeight:'500',fontSize:'14px',whiteSpace:'nowrap'}}>
            Get started
          </Link>
        </div>

        <p style={{textAlign:'center',marginTop:'32px',fontSize:'12px',color:'#9ca3af'}}>
          Powered by <strong style={{color:'#1a1a2e'}}>AMILLI AI, CORP</strong> · Data: US Census Bureau · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
