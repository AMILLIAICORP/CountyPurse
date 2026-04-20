import Link from 'next/link'
export default function PricingPage() {
  return (
    <div style={{minHeight:'100vh',background:'#f8f6f1'}}>
      <nav style={{borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8f6f1'}}>
        <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'18px',color:'#1a1a2e',textDecoration:'none'}}>County<span style={{color:'#2e7d5e'}}>Purse</span></Link>
        <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
          <Link href="/login" style={{fontSize:'14px',color:'#6b7280',textDecoration:'none'}}>Sign in</Link>
          <Link href="/signup" style={{fontSize:'14px',background:'#1a1a2e',color:'#f8f6f1',padding:'8px 16px',borderRadius:'6px',textDecoration:'none'}}>Get started</Link>
        </div>
      </nav>
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'80px 24px',textAlign:'center'}}>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'40px',color:'#1a1a2e',marginBottom:'12px'}}>Pricing</h1>
        <p style={{color:'#6b7280',fontSize:'18px',marginBottom:'60px'}}>Annual subscriptions. Cancel anytime.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'700px',margin:'0 auto'}}>
          {[{key:'OFFICE',name:'Office',price:'$499',desc:'For single county offices',featured:false,features:['Unlimited budget ingestions','AI plain-English parsing','Spending analytics dashboard','Export to CSV','Email support']},{key:'REGIONAL',name:'Regional Office',price:'$2,400',desc:'For regional & multi-county agencies',featured:true,features:['Everything in Office','Multi-county comparison','Regional rollup reports','API access','Priority support','Onboarding session']}].map(plan=>(
            <div key={plan.key} style={{background:'white',border:plan.featured?'2px solid #2e7d5e':'1px solid #e5e7eb',borderRadius:'12px',padding:'32px',textAlign:'left'}}>
              {plan.featured&&<div style={{fontSize:'11px',fontFamily:'monospace',color:'#2e7d5e',background:'#f0f7f4',border:'1px solid #2e7d5e',padding:'4px 10px',borderRadius:'4px',display:'inline-block',marginBottom:'16px',letterSpacing:'2px'}}>RECOMMENDED</div>}
              <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e',marginBottom:'8px'}}>{plan.name}</h2>
              <p style={{fontSize:'13px',color:'#9ca3af',marginBottom:'20px'}}>{plan.desc}</p>
              <div style={{fontSize:'42px',fontWeight:'bold',color:'#1a1a2e',marginBottom:'24px'}}>{plan.price}<span style={{fontSize:'14px',color:'#9ca3af',fontWeight:'normal'}}>/year</span></div>
              <Link href={`/signup?plan=${plan.key}`} style={{display:'block',textAlign:'center',padding:'12px',borderRadius:'8px',textDecoration:'none',fontWeight:'500',marginBottom:'24px',background:plan.featured?'#2e7d5e':'#1a1a2e',color:'white'}}>Get started</Link>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'10px'}}>
                {plan.features.map(f=><li key={f} style={{fontSize:'13px',color:'#4b5563',display:'flex',gap:'8px',alignItems:'center'}}><span style={{color:'#2e7d5e'}}>✓</span>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
