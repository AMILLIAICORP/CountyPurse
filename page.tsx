'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Department = {
  name: string
  amount: number
  percentOfTotal: number
  subcategories?: { name: string; amount: number }[]
}

type ParsedBudget = {
  countyName: string | null
  fiscalYear: string | null
  totalAmount: number | null
  departments: Department[]
  summary: string
  flags: string[]
}

const EXAMPLE = `Levy County FY2025 Budget Summary

Total Budget: $48,200,000

General Government: $6,100,000
  - Board of County Commissioners: $450,000
  - County Manager Office: $890,000
  - Finance & Accounting: $1,200,000
  - Human Resources: $680,000
  - IT Services: $1,400,000
  - Legal Services: $580,000
  - Facilities Management: $900,000

Public Safety: $14,800,000
  - Sheriff's Office: $9,200,000
  - Fire Rescue: $3,800,000
  - Emergency Management: $1,800,000

Transportation: $8,400,000
  - Road & Bridge: $5,600,000
  - Fleet Management: $1,400,000
  - Transit Services: $1,400,000

Health & Human Services: $7,200,000
  - Health Department: $3,100,000
  - Social Services: $2,400,000
  - Veterans Services: $880,000
  - Animal Services: $820,000

Parks & Recreation: $3,100,000
Environmental Services: $4,600,000
Debt Service: $4,000,000`

export default function IngestPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ budgetId: string; parsed: ParsedBudget } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/budgets/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, rawText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Parse failed')
      setResult({ budgetId: data.budget.id, parsed: data.parsed })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(2)}M`
      : `$${n.toLocaleString()}`

  if (result) {
    const { parsed } = result
    const maxAmt = Math.max(...parsed.departments.map((d) => d.amount))

    return (
      <div className="p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setResult(null)}
            className="text-sm text-gray-400 hover:text-ink transition-colors"
          >
            ← Ingest another
          </button>
          <span className="text-gray-300">|</span>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-ink transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <div className="font-mono text-xs text-sage uppercase tracking-widest mb-2">Budget parsed</div>
          <h1 className="font-serif text-3xl text-ink mb-1">
            {parsed.countyName || 'County'} {parsed.fiscalYear ? `· ${parsed.fiscalYear}` : ''}
          </h1>
          {parsed.totalAmount && (
            <p className="text-2xl font-bold text-sage">{fmt(parsed.totalAmount)}</p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="font-serif text-lg text-ink mb-3">Summary</h2>
          <p className="text-gray-700 leading-relaxed text-sm">{parsed.summary}</p>
        </div>

        {/* Flags */}
        {parsed.flags?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <h2 className="font-serif text-base text-amber-900 mb-3">Items to note</h2>
            <ul className="space-y-1.5">
              {parsed.flags.map((flag, i) => (
                <li key={i} className="text-sm text-amber-800 flex gap-2">
                  <span className="text-amber-500 mt-0.5">▲</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Department breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-serif text-lg text-ink mb-6">Department breakdown</h2>
          <div className="space-y-5">
            {parsed.departments.map((dept) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink">{dept.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-400">
                      {dept.percentOfTotal?.toFixed(1)}%
                    </span>
                    <span className="text-sm text-sage font-medium">{fmt(dept.amount)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage rounded-full transition-all"
                    style={{ width: `${(dept.amount / maxAmt) * 100}%` }}
                  />
                </div>
                {dept.subcategories && dept.subcategories.length > 0 && (
                  <div className="mt-2 pl-3 space-y-1 border-l border-gray-100">
                    {dept.subcategories.map((sub) => (
                      <div key={sub.name} className="flex justify-between text-xs text-gray-500">
                        <span>{sub.name}</span>
                        <span className="font-mono">{fmt(sub.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard/analytics"
            className="bg-sage text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-sage-light transition-colors"
          >
            View full analytics
          </Link>
          <button
            onClick={() => setResult(null)}
            className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ingest another budget
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="font-mono text-xs text-sage uppercase tracking-widest mb-3">Budget ingestion</div>
        <h1 className="font-serif text-3xl text-ink mb-2">Ingest a county budget</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Paste any budget text — annual reports, line-item lists, PDF copy-paste, or plain English descriptions.
          Our AI will parse, categorize, and structure it automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Budget title <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage bg-white"
            placeholder="e.g. Levy County FY2025 General Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Budget text</label>
            <button
              type="button"
              onClick={() => setRawText(EXAMPLE)}
              className="text-xs text-sage hover:underline"
            >
              Load example
            </button>
          </div>
          <textarea
            required
            rows={16}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage bg-white leading-relaxed"
            placeholder="Paste your county budget here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1.5">
            {rawText.length} characters · Works best with line-item budgets, department totals, or narrative budget documents
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || rawText.trim().length < 50}
          className="w-full bg-sage text-white py-4 rounded-lg font-medium hover:bg-sage-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Parsing budget…
            </span>
          ) : (
            'Parse budget →'
          )}
        </button>
      </form>
    </div>
  )
}
