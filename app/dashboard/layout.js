import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '▦' },
    { href: '/ingest', label: 'Ingest Budget', icon: '⊕' },
    { href: '/dashboard/budgets', label: 'My Budgets', icon: '☰' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '◈' },
  ]

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f8f6f1'}}>
      <aside style={{width:'240px',background:'#1a1a2e',display:'flex',flexDirection:'column',position:'fixed',height:'100%',zIndex:40}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <Link href="/" style={{fontFamily:'Georgia,serif',fontWeight:'bold',fontSize:'18px',color:'#f8f6f1',textDecoration:'none'}}>County<span style={{color:'#2e7d5e'}}>Purse</span></Link>
        </div>
        <nav style={{flex:1,padding:'24px 12px',display:'flex',flexDirection:'column',gap:'4px'}}>
          {navItems.map(item=>(
            <Link key={item.href} href={item.href} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 12px',borderRadius:'8px',fontSize:'14px',color:'#d1d5db',textDecoration:'none'}}>
              <span style={{color:'#2e7d5e',fontSize:'12px',width:'16px'}}>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div style={{padding:'20px 24px',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{fontSize:'12px',color:'#6b7280',marginBottom:'8px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{fontSize:'12px',color:'#9ca3af',background:'none',border:'none',cursor:'pointer',padding:0}}>Sign out</button>
          </form>
        </div>
      </aside>
      <main style={{marginLeft:'240px',flex:1,minHeight:'100vh'}}>{children}</main>
    </div>
  )
}
