'use client'
import { useState } from 'react'
import Link from 'next/link'

const STATE_EMOJI = {
  Arizona: '🌵',
  California: '🌊',
  Florida: '🌴',
  Georgia: '🍑',
  Illinois: '🏙️',
  Michigan: '🚗',
  'New York': '🗽',
  'North Carolina': '🌲',
  Ohio: '🌻',
  Texas: '⭐',
  Washington: '🌲',
}

export default function CountiesSearch({ counties }) {
  const [query, setQuery] = useState('')
  const [selectedState, setSelectedState] = useState('All')

  const states = ['All', ...new Set(counties.map(c => c.state)).values()].sort()

  const filtered = counties.filter(c => {
    const matchesQuery = query === '' ||
      c.county_name.toLowerCase().includes(query.toLowerCase()) ||
      c.state.toLowerCase().includes(query.toLowerCase())
    const matchesState = selectedState === 'All' || c.state === selectedState
    return matchesQuery && matchesState
  })

  const byState = {}
  for (const c of filtered) {
    if (!byState[c.state]) byState[c.state] = []
    byState[c.state].push(c)
  }

  const fmt = n => n >= 1000000000 ? '$' + (n/1000000000).toFixed(1) + 'B' : '$' + (n/1000000).toFixed(1) + 'M'

  return (
    <div>
      <div style={{display:'flex',gap:'12px',marginBottom:'32px',flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Search by county or state..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{flex:1,minWidth:'200px',border:'1px solid #e5e7eb',borderRadius:'8px',padding:'12px 16px',fontSize:'14px',background:'white',outline:'none'}}
        />
        <select
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
          style={{border:'1px solid #e5e7eb',borderRadius:'8px',padding:'12px 16px',fontSize:'14px',background:'white',outline:'none',cursor:'pointer'}}
        >
          {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All states' : s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{background:'white',border:'2px dashed #e5e7eb',borderRadius:'12px',padding:'60px',textAlign:'center'}}>
          <p style={{fontFamily:'Georgia,serif',color:'#9ca3af',fontSize:'20px',marginBottom:'8px'}}>No counties found</p>
          <p style={{color:'#9ca3af',fontSize:'14px'}}>Try a different search or <Link href="/signup" style={{color:'#2e7d5e'}}>add your county</Link></p>
        </div>
      ) : (
        Object.entries(byState).sort(([a],[b]) => a.localeCompare(b)).map(([state, stateCo]) => (
          <div key={state} style={{marginBottom:'40px'}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e',marginBottom:'16px'}}>
              {STATE_EMOJI[state] || '📋'} {state} <span style={{fontSize:'14px',color:'#9ca3af',fontWeight:'normal'}}>({stateCo.length} {stateCo.length === 1 ? 'county' : 'counties'})</span>
            </h2>
            <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',overflow:'hidden'}}>
              <div style={{padding:'12px 24px',borderBottom:'1px solid #f3f4f6',background:'#f9fafb',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',gap:'16px'}}>
                <span style={{fontSize:'11px',fontFamily:'monospace',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'2px'}}>County</span>
                <span style={{fontSize:'11px',fontFamily:'monospace',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'2px'}}>Fiscal Year</span>
                <span style={{fontSize:'11px',fontFamily:'monospace',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'2px',textAlign:'right'}}>Total Budget</span>
                <span style={{fontSize:'11px',fontFamily:'monospace',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'2px'}}>Summary</span>
              </div>
              {stateCo.map((c, i) => (
                <Link
                  key={c.id}
                  href={'/counties/' + c.id}
                  style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',gap:'16px',padding:'16px 24px',borderBottom:i < stateCo.length-1?'1px solid #f3f4f6':'none',textDecoration:'none',background:'white'}}
                >
                  <div>
                    <p style={{fontWeight:'500',color:'#1a1a2e',fontSize:'14px',marginBottom:'2px'}}>{c.county_name} County</p>
                    <p style={{fontSize:'12px',color:'#9ca3af'}}>{state}</p>
                  </div>
                  <p style={{fontSize:'14px',color:'#6b7280',fontFamily:'monospace',alignSelf:'center'}}>{c.fiscal_year || '—'}</p>
                  <p style={{fontSize:'14px',color:'#2e7d5e',fontWeight:'500',textAlign:'right',alignSelf:'center'}}>{c.total_amount ? fmt(c.total_amount) : '—'}</p>
                  <p style={{fontSize:'13px',color:'#6b7280',alignSelf:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.parsed_data?.summary?.slice(0,80) || 'View details →'}</p>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
