'use client'
import { useState } from 'react'

export default function BudgetClient({ budget }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `I've analyzed the ${budget.title || 'budget'} for ${budget.county_name}. Ask me anything about this budget — spending priorities, department breakdowns, anomalies, or comparisons.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const quickQuestions = [
    'What are the top 3 spending departments?',
    'Are there any unusual spending patterns?',
    'How is the budget distributed across departments?',
    'What percentage goes to public safety?',
  ]

  async function sendMessage(text) {
    const message = text || input.trim()
    if (!message) return
    setInput('')
    setLoading(true)
    const newMessages = [...messages, { role: 'user', content: message }]
    setMessages(newMessages)

    try {
      const res = await fetch('/api/budgets/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, budgetId: budget.id, budgetData: budget })
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry I had trouble processing that. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',overflow:'hidden',marginBottom:'24px'}}>
      <div style={{padding:'20px 24px',borderBottom:'1px solid #f3f4f6',background:'#f9fafb',display:'flex',alignItems:'center',gap:'10px'}}>
        <span style={{fontSize:'18px'}}>🧠</span>
        <div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e'}}>AI Budget Analysis</h2>
          <p style={{fontSize:'12px',color:'#9ca3af'}}>Ask questions about this budget in plain English</p>
        </div>
      </div>

      <div style={{padding:'24px'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'20px'}}>
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} style={{background:'#f0f7f4',border:'1px solid #d1fae5',color:'#065f46',padding:'6px 14px',borderRadius:'999px',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>
              {q}
            </button>
          ))}
        </div>

        <div style={{background:'#f9fafb',borderRadius:'8px',padding:'16px',marginBottom:'16px',maxHeight:'400px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px'}}>
          {messages.map((m, i) => (
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
              <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:'8px',fontSize:'14px',lineHeight:1.6,background:m.role==='user'?'#2e7d5e':'white',color:m.role==='user'?'white':'#1a1a2e',border:m.role==='user'?'none':'1px solid #e5e7eb'}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:'flex',justifyContent:'flex-start'}}>
              <div style={{background:'white',border:'1px solid #e5e7eb',padding:'10px 14px',borderRadius:'8px',fontSize:'14px',color:'#9ca3af'}}>
                Analyzing...
              </div>
            </div>
          )}
        </div>

        <div style={{display:'flex',gap:'8px'}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask anything about this budget..."
            style={{flex:1,border:'1px solid #e5e7eb',borderRadius:'8px',padding:'10px 14px',fontSize:'14px',outline:'none',fontFamily:'inherit'}}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{background:'#2e7d5e',color:'white',border:'none',padding:'10px 20px',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',opacity:loading||!input.trim()?0.5:1}}>
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}
