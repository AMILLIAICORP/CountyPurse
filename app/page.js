import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{minHeight:'100vh',background:'#f8f6f1'}}>
      <nav style={{borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8f6f1',position:'sticky',top:0,zIndex:50}}>
        <span style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'18px',color:'#1a1a2e'}}>
          County<span style={{color:'#2e7d5e'}}>Purse</span>
        </span>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/counties" style={{fontSize:'14px',color:'#4b5563',textDecoration:'none'}}>Browse Counties</Link>
          <Link href="/pricing" style={{fontSize:'14px',color:'#4b5563',textDecoration:'none'}}>Pricing</Link>
          <Link href="/login" style={{fontSize:'14px',color:'#4b5563',textDecoration:'none'}}>Sign in</Link>
          <Link href="/signup" style={{fontSize:'14px',background:'#1a1a2e',color:'#f8f6f1',padding:'8px 16px',borderRadius:'6px',textDecoration:'none'}}>Get started</Link>
        </div>
      </nav>
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'80px 24px'}}>
        <div style={{fontSize:'12px',fontFamily:'monospace',color:'#2e7d5e',border:'1px solid #2e7d5e',background:'#f0f7f4',padding:'4px 12px',borderRadius:'4px',display:'inline-block',marginBottom:'32px',letterSpacing:'2px'}}>
          FINANCIAL INTELLIGENCE FOR LOCAL GOVERNMENT
        </div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'56px',lineHeight:1.2,color:'#1a1a2e',marginBottom:'24px'}}>
          Make sense of every <em style={{color:'#2e7d5e'}}>public dollar</em> your county spends.
        </h1>
        <p style={{fontSize:'20px',color:'#6b7280',lineHeight:1.7,marginBottom:'40px',maxWidth:'600px'}}>
          Paste any county budget in plain English and CountyPurse instantly transforms it into structured spending intelligence your office can act on.
        </p>
        <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
          <Link href="/signup" style={{background:'#2e7d5e',color:'white',padding:'14px 32px',borderRadius:'6px',textDecoration:'none',fontWeight:'500'}}>Start free trial</Link>
          <Link href="/counties" style={{background:'white',border:'1px solid #e5e7eb',color:'#1a1a2e',padding:'14px 32px',borderRadius:'6px',textDecoration:'none',fontWeight:'500'}}>Browse public budgets</Link>
          <Link href="/pricing" style={{border:'1px solid rgba(26,26,46,0.2)',color:'#1a1a2e',padding:'14px 32px',borderRadius:'6px',textDecoration:'none',fontWeight:'500'}}>See pricing</Link>
        </div>
      </div>
      <section style={{borderTop:'1px solid #e5e7eb',borderBottom:'1px solid #e5e7eb',background:'white',padding:'64px 24px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'48px'}}>
          {[
            {label:'01',title:'Ingest plain English',body:'Paste raw budget text, upload a PDF, or type line items in plain language. Our AI reads it the way a budget analyst would.'},
            {label:'02',title:'Structured intelligence',body:'Every category, department, and allocation is automatically tagged, normalized, and made searchable across fiscal years.'},
            {label:'03',title:'Analytics that matter',body:'See where money flows, spot anomalies, compare departments, and generate reports your council can understand.'},
          ].map(f => (
            <div key={f.label}>
              <div style={{fontSize:'12px',fontFamily:'monospace',color:'#2e7d5e',marginBottom:'12px'}}>{f.label}</div>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#1a1a2e',marginBottom:'12px'}}>{f.title}</h3>
              <p style={{color:'#6b7280',lineHeight:1.6,fontSize:'14px'}}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{borderTop:'1px solid #e5e7eb',padding:'24px',marginTop:'80px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:'Georgia,serif',color:'#1a1a2e',fontSize:'14px'}}>County<span style={{color:'#2e7d5e'}}>Purse</span></span>
          <span style={{fontSize:'12px',color:'#9ca3af'}}>Powered by <strong style={{color:'#1a1a2e'}}>AMILLI AI, CORP</strong> · © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
