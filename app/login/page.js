'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (err) { setError('Invalid email or password'); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8f6f1',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'24px',color:'#1a1a2e',textDecoration:'none'}}>County<span style={{color:'#2e7d5e'}}>Purse</span></Link>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#1a1a2e',margin:'24px 0 8px'}}>Sign in</h1>
          <p style={{color:'#9ca3af',fontSize:'14px'}}>Welcome back</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div>
            <label style={{display:'block',fontSize:'14px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Email</label>
            <input type="email" required placeholder="jane@county.gov" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'8px',padding:'12px 16px',fontSize:'14px',background:'white',boxSizing:'border-box'}} />
          </div>
          <div>
            <label style={{display:'block',fontSize:'14px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Password</label>
            <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'8px',padding:'12px 16px',fontSize:'14px',background:'white',boxSizing:'border-box'}} />
          </div>
          {error&&<p style={{color:'#dc2626',fontSize:'14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'12px 16px'}}>{error}</p>}
          <button type="submit" disabled={loading} style={{background:'#1a1a2e',color:'white',padding:'14px',borderRadius:'8px',border:'none',fontWeight:'500',fontSize:'14px',cursor:'pointer',opacity:loading?0.5:1}}>
            {loading?'Signing in…':'Sign in'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:'14px',color:'#9ca3af',marginTop:'24px'}}>No account? <Link href="/pricing" style={{color:'#2e7d5e'}}>See pricing</Link></p>
      </div>
    </div>
  )
}
