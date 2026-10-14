#!/usr/bin/env node
// Read provider settings only. Generating an OAuth URL does not prove a
// provider is enabled, credentials are valid, or the consent flow works.
require('dotenv').config({ path: '.env.local', quiet: true })

async function checkAuthSettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local first.')
  const response = await fetch(new URL('/auth/v1/settings', url), { headers: { apikey: key } })
  if (!response.ok) throw new Error(`Unable to read public Auth settings (HTTP ${response.status}).`)
  const settings = await response.json()
  console.log(`Google provider enabled: ${settings.external?.google === true}`)
  console.log(`Email provider enabled: ${settings.external?.email === true}`)
  console.log(`Email confirmation required: ${settings.mailer_autoconfirm === false}`)
  console.log(`New signups enabled: ${settings.disable_signup === false}`)
  console.log('Provider flags do not verify SMTP delivery or Google consent. Complete the browser checks in scripts/setup-oauth.md.')
}

checkAuthSettings().catch(error => { console.error(error.message); process.exitCode = 1 })
