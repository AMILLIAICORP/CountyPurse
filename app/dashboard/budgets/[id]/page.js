import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BudgetClient from './client'

export default async function BudgetDetailPage({ params: paramsPromise }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await paramsPromise

  const { data: budget } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!budget) notFound()

  const parsed = budget.parsed_data || {}
  const departments = parsed.departments || []
  const fmt = n => n >= 1000000000 ? `$${(n/1000000000).toFixed(1)}B` : n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n?.toLocaleString() || '—'}`

  return (
    <div style={{padding:'32px'}}>
      <div style={{marginBottom:'24px'}}>
        <Link href="/dashboard/budgets" style={{fontSize:'13px',color:'#9ca3af',textDecoration:'none'}}>← All budgets</Link>
      </div>

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'32px',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e',marginBottom:'4px'}}>{budget.title || 'Budget'}</h1>
          <p style={{color:'#9ca3af',fontSize:'14px'}}>{budget.county_name} · {budget.fiscal_year || 'FY unknown'} · Ingested {new Date(budget.created_at).toLocaleDateString()}</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <a href={`/api/budgets/${budget.id}/export`} style={{background:'white',border:'1px solid #e5e7eb',color:'#4b5563',padding:'8px 16px',borderRadius:'8px',textDecoration:'none',fontSize:'13px',fontWeight:'500'}}>
            ↓ Export CSV
          </a>
          <a href={`/api/budgets/${budget.id}/export?format=json`} style={{background:'white',border:'1px solid #e5e7eb',color:'#4b5563',padding:'8px 16px',borderRadius:'8px',textDecoration:'none',fontSize:'13px',fontWeight:'500'}}>
            ↓ Export JSON
          </a>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'32px'}}>
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px'}}>
          <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Total Budget</p>
          <p style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e'}}>{budget.total_amount ? fmt(budget.total_amount) : '—'}</p>
        </div>
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px'}}>
          <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Departments</p>
          <p style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e'}}>{departments.length || '—'}</p>
        </div>
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px'}}>
          <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Fiscal Year</p>
          <p style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e'}}>{budget.fiscal_year || '—'}</p>
        </div>
      </div>

      {parsed.summary && (
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e',marginBottom:'12px'}}>Summary</h2>
          <p style={{color:'#4b5563',lineHeight:1.7,fontSize:'15px'}}>{parsed.summary}</p>
        </div>
      )}

      {departments.length > 0 && (
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e',marginBottom:'20px'}}>Department Breakdown</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            {departments.map((dept, i) => (
              <div key={i}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                  <span style={{fontWeight:'500',color:'#1a1a2e',fontSize:'14px'}}>{dept.name}</span>
                  <span style={{fontFamily:'monospace',fontWeight:'700',color:'#2e7d5e',fontSize:'14px'}}>{dept.amount ? fmt(dept.amount) : '—'}</span>
                </div>
                {dept.percentOfTotal && (
                  <>
                    <div style={{background:'#e5e7eb',borderRadius:'999px',height:'6px',overflow:'hidden'}}>
                      <div style={{background:'#2e7d5e',height:'100%',width:Math.min(parseFloat(dept.percentOfTotal),100)+'%',borderRadius:'999px'}}></div>
                    </div>
                    <p style={{fontSize:'11px',color:'#9ca3af',marginTop:'4px'}}>{dept.percentOfTotal}% of total</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.flags && parsed.flags.length > 0 && (
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e',marginBottom:'12px'}}>Flags & Anomalies</h2>
          {parsed.flags.map((flag, i) => (
            <div key={i} style={{display:'flex',gap:'10px',padding:'10px',background:'#fef3c7',borderRadius:'6px',fontSize:'14px',color:'#92400e',marginBottom:'8px'}}>
              <span>⚠</span><span>{flag}</span>
            </div>
          ))}
        </div>
      )}

      <BudgetClient budget={budget} />
    </div>
  )
}
