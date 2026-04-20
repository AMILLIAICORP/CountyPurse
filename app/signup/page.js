'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get('plan') || 'OFFICE'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('signup')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name, plan: 'FREE' } }
      })
      if (signUpError) throw new Error(signUpError.message)
      setStep('payment')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: form.email, name: form.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      if (data.url) window.location.href = data.url
      else router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'payment') {
    return (
      <div style={{minHeight:'100vh',background:'#f8f6f1',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px'}}>
        <div style={{width:'100%',maxWidth:'420px',textAlign:'center'}}>
          <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'20px',color:'#1a1a2e',textDecoration:'none'}}>County<span style={{color:'#2e7d5e'}}>Purse</span></Link>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'32px',marginTop:'32px'}}>
            <div style={{fontSize:'40px',marginBottom:'16px'}}>✓</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e',marginBottom:'8px'}}>Account created!</h2>
            <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'24px'}}>Now complete your subscription to access CountyPurse.</p>
            <div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:'8px',padding:'16px',marginBottom:'24px',textAlign:'left'}}>
              <p style={{fontSize:'12px',color:'#9ca3af',marginBottom:'4px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'1px'}}>Selected plan</p>
              <p style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e'}}>{plan === 'REGIONAL' ? 'Regional Office — $2,400/yr' : 'Office — $499/yr'}</p>
            </div>
            {error && <p style={{color:'#dc2626',fontSize:'14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'12px',marginBottom:'16px'}}>{error}</p>}
            <button onClick={handlePayment} disabled={loading} style={{width:'100%',background:'#2e7d5e',color:'white',padding:'14px',borderRadius:'8px',border:'none',fontWeight:'500',fontSize:'14px',cursor:'pointer',opacity:loading?0.5:1}}>
              {loading ? 'Redirecting…' : 'Continue to payment →'}
            </button>
            <p style={{marginTop:'16px',fontSize:'13px',color:'#9ca3af'}}>
              Or <Link href="/dashboard" style={{color:'#2e7d5e'}}>go to dashboard</Link> first
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8f6f1',display:'flex'}}>
      <div style={{display:'none',width:'50%',background:'#1a1a2e',flexDirection:'column',justifyContent:'space-between',padding:'48px'}}>
        <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'20px',color:'#f8f6f1',textDecoration:'none'}}>County<span style={{color:'#2e7d5e'}}>Purse</span></Link>
        <div>
          <h2 style={{fontFamily:'Georgia,serif',color:'#f8f6f1',fontSize:'28px',lineHeight:1.4,marginBottom:'16px'}}>"Finally, a tool that speaks the language of county government."</h2>
          <p style={{color:'#6b7280',fontSize:'14px'}}>— Budget Director, Alachua County</p>
        </div>
        <p style={{color:'#4b5563',fontSize:'12px'}}>© {new Date().getFullYear()} countypurse.com</p>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'32px'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'20px',color:'#1a1a2e',textDecoration:'none'}}>County<span style={{color:'#2e7d5e'}}>Purse</span></Link>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e',margin:'24px 0 8px'}}>Create your account</h1>
          <p style={{color:'#9ca3af',fontSize:'14px',marginBottom:'32px'}}>Plan: <span style={{color:'#2e7d5e',fontWeight:'500'}}>{plan === 'REGIONAL' ? 'Regional Office — $2,400/yr' : 'Office — $499/yr'}</span></p>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div>
              <label style={{display:'block',fontSize:'14px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Full name</label>
              <input type="text" required placeholder="Jane Smith" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'8px',padding:'12px 16px',fontSize:'14px',background:'white',boxSizing:'border-box'}} />
            </div>
            <div>
              <label style={{display:'block',fontSize:'14px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Work email</label>
              <input type="email" required placeholder="jane@county.gov" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'8px',padding:'12px 16px',fontSize:'14px',background:'white',boxSizing:'border-box'}} />
            </div>
            <div>
              <label style={{display:'block',fontSize:'14px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Password</label>
              <input type="password" required minLength={6} placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'8px',padding:'12px 16px',fontSize:'14px',background:'white',boxSizing:'border-box'}} />
            </div>
            {error && <p style={{color:'#dc2626',fontSize:'14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'12px 16px'}}>{error}</p>}
            <button type="submit" disabled={loading} style={{background:'#2e7d5e',color:'white',padding:'14px',borderRadius:'8px',border:'none',fontWeight:'500',fontSize:'14px',cursor:'pointer',opacity:loading?0.5:1}}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
          <p style={{textAlign:'center',fontSize:'14px',color:'#9ca3af',marginTop:'24px'}}>Already have an account? <Link href="/login" style={{color:'#2e7d5e'}}>Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>
}
