import { glossaryEntries, valueExamples } from './glossary'

export type InlineReference = { kind: 'term' | 'value'; id: string }
export type ReferencePart = { text: string; reference?: InlineReference }
const plainTerms = new Set([
  'baseline',
  'cue-cluster',
  'reassessment',
  'escalation',
])
const escapePattern = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Search aliases include related concepts. Only equivalent labels belong in inline definitions.
const inlineAliases: Record<string, string[]> = {
  dvt: ['DVT'],
  pe: ['PE'],
  coeliac: ['celiac disease'],
  hypovolaemia: ['hypovolemia'],
  hypotension: ['low blood pressure'],
  ischaemia: ['ischemia'],
  acs: ['ACS'],
  ecg: ['ECG', 'EKG'],
  murmur: ['cardiac murmur'],
  s3: ['S3'],
  dyspnoea: ['dyspnea', 'shortness of breath'],
  tachypnoea: ['tachypnea'],
  spo2: ['SpO2'],
  'last-known-well': ['LKW', 'last known normal'],
}
const termPatterns = glossaryEntries
  .filter((entry) => !plainTerms.has(entry.id))
  .flatMap((entry) =>
    [entry.term, ...(inlineAliases[entry.id] ?? [])].map((phrase) => ({
      pattern: escapePattern(phrase),
      reference: { kind: 'term', id: entry.id } as InlineReference,
    }))
  )
// Match a named measurement with its unit, never infer an analyte from a bare number.
const measurementPatterns = [
  {
    id: 'sodium',
    name: '(?:serum |blood )?(?:sodium|Na\\+?)',
    unit: '(?:mEq|mmol)/L',
  },
  {
    id: 'potassium',
    name: '(?:serum |blood )?(?:potassium|K\\+?)',
    unit: '(?:mEq|mmol)/L',
  },
  { id: 'bun', name: '(?:blood urea nitrogen|BUN)', unit: 'mg/dL' },
  {
    id: 'pulse',
    name: '(?:heart rate|pulse|HR)',
    unit: '(?:beats?/(?:min|minute)|bpm|/min)',
  },
  {
    id: 'breathing',
    name: '(?:respiratory rate|RR)',
    unit: '(?:breaths?/(?:min|minute)|/min)',
  },
].map((entry) => ({
  pattern: `${entry.name}\\s*(?:(?:is|of|=|:)\\s*)?\\d+(?:\\.\\d+)?\\s*${entry.unit}`,
  reference: { kind: 'value', id: entry.id } as InlineReference,
}))

export function referenceParts(text: string): ReferencePart[] {
  const matches = [...termPatterns, ...measurementPatterns]
    .flatMap(({ pattern, reference }) =>
      [
        ...text.matchAll(
          new RegExp(
            `(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`,
            'giu'
          )
        ),
      ].map((match) => ({ start: match.index!, text: match[0], reference }))
    )
    .sort((a, b) => a.start - b.start || b.text.length - a.text.length)
  const parts: ReferencePart[] = []
  const used = new Set<string>()
  let cursor = 0
  for (const match of matches) {
    const key = `${match.reference.kind}:${match.reference.id}`
    if (match.start < cursor || used.has(key) || used.size >= 3) continue
    if (match.start > cursor)
      parts.push({ text: text.slice(cursor, match.start) })
    parts.push({ text: match.text, reference: match.reference })
    cursor = match.start + match.text.length
    used.add(key)
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) })
  return parts
}

export function getInlineReference(reference: InlineReference) {
  if (reference.kind === 'term') {
    const entry = glossaryEntries.find((term) => term.id === reference.id)
    return entry
      ? {
          title: entry.term,
          definition: entry.definition,
          source: entry.source,
          href: `/glossary?term=${encodeURIComponent(entry.term)}`,
          kind: 'term' as const,
        }
      : null
  }
  const value = valueExamples.find((entry) => entry.id === reference.id)
  return value
    ? {
        title: value.name,
        definition: value.context,
        example: value.example,
        source: value.source,
        href: `/glossary?view=values&term=${encodeURIComponent(value.name)}`,
        kind: 'value' as const,
      }
    : null
}
