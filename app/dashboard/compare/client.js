'use client'
import { useState } from 'react'

export default function CompareClient({ counties }) {
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')

  const filtered = counties.filter(c =>
    c.county_name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50)

  const toggle = (county) => {
    if (selected.find(s => s.id === county.id)) {
      setSelected(selected.filter(s => s.id !== county.id))
    } else if (selected.length < 5) {
      setSelected([...selected, county])
    }
  }

  const fmt = n => {
    if (!n) return '—'
    if (n >= 1000000000) return '$' + (n/1000000000).toFixed(1) + 'B'
    if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M'
    if (n >= 1000) return '$' + (n/1000).toFixed(0) + 'K'
    return '$' + n.toLocaleString()
  }

  const maxBudget = Math.max(...selected.map(c => c.total_amount || 0))

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:'24px'}}>
        <div>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
            <p style={{fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px'}}>Select counties (max 5)</p>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search counties..."
              style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 12px',fontSize:'13px',outline:'none',marginBottom:'12px',fontFamily:'inherit'}}
            />
            <div style={{maxHeight:'400px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'4px'}}>
              {filtered.map(c => (
                <div
                  key={c.id}
                  onClick={() => toggle(c)}
                  style={{padding:'8px 12px',borderRadius:'6px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',background:selected.find(s=>s.id===c.id)?'#f0f7f4':'transparent',border:selected.find(s=>s.id===c.id)?'1px solid #d1fae5':'1px solid transparent'}}
                >
                  <div>
                    <p style={{fontSize:'13px',fontWeight:'500',color:'#1a1a2e'}}>{c.county_name}</p>
                    <p style={{fontSize:'11px',color:'#9ca3af'}}>{c.state}</p>
                  </div>
                  {selected.find(s=>s.id===c.id) && <span style={{color:'#2e7d5e',fontSize:'16px'}}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {selected.length === 0 ? (
            <div style={{background:'white',border:'2px dashed #e5e7eb',borderRadius:'12px',padding:'60px',textAlign:'center'}}>
              <p style={{fontFamily:'Georgia,serif',color:'#9ca3af',fontSize:'20px',marginBottom:'8px'}}>Select counties to compare</p>
              <p style={{color:'#9ca3af',fontSize:'14px'}}>Choose up to 5 counties from the list on the left</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#f9fafb'}}>
                      <th style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'1px',textTransform:'uppercase'}}>County</th>
                      <th style={{padding:'12px 16px',textAlign:'right',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'1px',textTransform:'uppercase'}}>Total Budget</th>
                      <th style={{padding:'12px 16px',textAlign:'right',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'1px',textTransform:'uppercase'}}>Population</th>
                      <th style={{padding:'12px 16px',textAlign:'right',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'1px',textTransform:'uppercase'}}>Per Capita</th>
                      <th style={{padding:'12px 16px',textAlign:'right',fontSize:'11px',color:'#9ca3af',fontFamily:'monospace',letterSpacing:'1px',textTransform:'uppercase'}}>Median Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.map((c, i) => {
                      const pop = c.parsed_data?.population
                      const income = c.parsed_data?.medianHouseholdIncome
                      const perCapita = pop && c.total_amount ? c.total_amount / pop : null
                      return (
                        <tr key={c.id} style={{borderTop:'1px solid #f3f4f6'}}>
                          <td style={{padding:'14px 16px'}}>
                            <p style={{fontWeight:'500',color:'#1a1a2e',fontSize:'14px'}}>{c.county_name}</p>
                            <p style={{fontSize:'12px',color:'#9ca3af'}}>{c.state}</p>
                          </td>
                          <td style={{padding:'14px 16px',textAlign:'right',fontWeight:'600',color:'#2e7d5e',fontSize:'14px'}}>{fmt(c.total_amount)}</td>
                          <td style={{padding:'14px 16px',textAlign:'right',fontSize:'14px',color:'#4b5563'}}>{pop ? pop.toLocaleString() : '—'}</td>
                          <td style={{padding:'14px 16px',textAlign:'right',fontSize:'14px',color:'#4b5563'}}>{perCapita ? '$' + Math.round(perCapita).toLocaleString() : '—'}</td>
                          <td style={{padding:'14px 16px',textAlign:'right',fontSize:'14px',color:'#4b5563'}}>{income ? '$' + income.toLocaleString() : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {maxBudget > 0 && (
                <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px'}}>
                  <h3 style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e',marginBottom:'20px'}}>Budget Comparison</h3>
                  {selected.map(c => (
                    <div key={c.id} style={{marginBottom:'16px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{fontSize:'13px',fontWeight:'500',color:'#1a1a2e'}}>{c.county_name}, {c.state}</span>
                        <span style={{fontSize:'13px',fontWeight:'600',color:'#2e7d5e'}}>{fmt(c.total_amount)}</span>
                      </div>
                      <div style={{background:'#e5e7eb',borderRadius:'999px',height:'8px',overflow:'hidden'}}>
                        <div style={{background:'#2e7d5e',height:'100%',width:(c.total_amount && maxBudget ? (c.total_amount/maxBudget)*100 : 0)+'%',borderRadius:'999px',transition:'width 0.3s'}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px'}}>
                <h3 style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e',marginBottom:'16px'}}>Department Breakdown</h3>
                <div style={{display:'grid',gridTemplateColumns:`repeat(${selected.length},1fr)`,gap:'16px'}}>
                  {selected.map(c => (
                    <div key={c.id}>
                      <p style={{fontSize:'13px',fontWeight:'600',color:'#1a1a2e',marginBottom:'12px'}}>{c.county_name}</p>
                      {(c.parsed_data?.departments || []).slice(0,5).map((d,i) => (
                        <div key={i} style={{marginBottom:'8px'}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                            <span style={{fontSize:'11px',color:'#4b5563'}}>{d.name}</span>
                            <span style={{fontSize:'11px',color:'#2e7d5e',fontWeight:'600'}}>{d.percentOfTotal ? d.percentOfTotal+'%' : '—'}</span>
                          </div>
                          {d.percentOfTotal && (
                            <div style={{background:'#e5e7eb',borderRadius:'999px',height:'4px',overflow:'hidden'}}>
                              <div style={{background:'#2e7d5e',height:'100%',width:Math.min(parseFloat(d.percentOfTotal),100)+'%',borderRadius:'999px'}}></div>
                            </div>
                          )}
                        </div>
                      ))}
                      {!(c.parsed_data?.departments?.length) && <p style={{fontSize:'12px',color:'#9ca3af'}}>No department data</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
