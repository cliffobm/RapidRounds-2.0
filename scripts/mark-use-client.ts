// scripts/mark-use-client.ts
import fs from 'fs'
import cp from 'child_process'

function main() {
  const exts = ['tsx', 'jsx']
  const files = cp
    .execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && exts.some((ext) => f.endsWith(ext)))

  const CLIENT_SIGNS = [
    /onClick\s*=/,
    /onChange\s*=/,
    /onSubmit\s*=/,
    /\buseState\b/,
    /\buseEffect\b/,
    /\buseRef\b/,
    /\buseTransition\b/,
    /window\./,
    /document\./,
  ]

  let patched = 0
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8')
    if (/^\s*['\"]use client['\"]/m.test(s)) continue
    if (/(middleware|next\.config|postcss\.config|tailwind\.config)\./.test(f)) continue

    const isInteractive = CLIENT_SIGNS.some((rx) => rx.test(s))
    if (!isInteractive) continue

    fs.writeFileSync(f, `'use client'\n` + s, 'utf8')
    patched++
    console.log('Marked client:', f)
  }
  console.log(`Total files marked "use client": ${patched}`)
}

main()
