import Link from 'next/link'
import { readFileSync } from 'fs'
import path from 'path'

type Manifest = { banks: Array<{ key: string; title: string }> }

export default async function Page() {
  // Build a simple list of known scenario codes from seed CSV
  // Fallback to static list if file not available
  let codes: Array<{ code: string; title: string }> = []
  try {
    const csvPath = path.resolve(process.cwd(), 'supabase/qbank/seed_scenario_questions.csv')
    const csv = readFileSync(csvPath, 'utf-8').split('\n').slice(1)
    const seen = new Set<string>()
    for (const line of csv) {
      if (!line.trim()) continue
      const [code, title] = line.split(',')
      if (code && !seen.has(code)) {
        seen.add(code)
        codes.push({ code, title: title || code })
      }
    }
  } catch {
    codes = [
      { code: 'cvd_001', title: 'Acute Chest Pain in ED' },
      { code: 'resp_001', title: 'COPD Exacerbation on the Floor' },
      { code: 'endo_001', title: 'DKA in Young Adult' },
      { code: 'neuro_001', title: 'Stroke Alert' },
      { code: 'skin_001', title: 'Pressure Injury Risk' },
    ]
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">RR Scenarios</h1>
      <p className="text-slate-600">Select a scenario to practice.</p>
      <ul className="space-y-2">
        {codes.map(({ code, title }) => (
          <li key={code}>
            <Link className="text-primary hover:underline" href={`/rr/${code}`}>
              {title} <span className="text-slate-400">({code})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}


