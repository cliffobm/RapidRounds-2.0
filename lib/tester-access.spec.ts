import { describe, expect, it } from 'vitest'
import {
  isPublicTesterResource,
  safeTesterDestination,
  testerPublicPages,
} from './tester-access'

describe('tester destination validation', () => {
  it('preserves known local pages, case identifiers, query parameters and fragments', () => {
    for (const value of [
      '/',
      '/home',
      '/account',
      '/settings',
      '/practice?topic=cardiac&count=10',
      '/rapid-response?case=wide-complex-collapse&session=saved-attempt',
      '/evolving/headache?level=advanced',
      '/rr/fluid-loss',
      '/study/topics/critical-care#ventilation',
      '/study/cardiac-fundamentals',
      '/pathway/transfer',
      '/test/mixed-practice',
      '/reference/lab-values',
      '/review-guide',
      '/content-review',
    ]) {
      expect(safeTesterDestination(value)).toBe(value)
    }
  })

  it('rejects external, protocol-relative, backslash and control-character destinations', () => {
    for (const value of [
      'https://attacker.example/practice',
      'http://rapidrounds.local/home',
      '//attacker.example/home',
      '///attacker.example/home',
      '\\attacker.example\\home',
      '/\\attacker.example/home',
      '/home\\@attacker.example',
      'javascript:alert(1)',
      'data:text/html,unsafe',
      '/home\n',
      '/home\r',
      '/home\t',
      '/home\u0000',
      '/home\u007f',
    ]) {
      expect(safeTesterDestination(value)).toBe('/home')
    }
  })

  it('rejects authentication loops, APIs, assets, unknown paths and encoded path escapes', () => {
    for (const value of [
      '/tester-login',
      '/tester-login?redirectTo=/practice',
      '/auth',
      '/auth/sign-in',
      '/auth/callback?code=private-code',
      '/api/metrics/log',
      '/_next/static/private.js',
      '/_next/data/build/home.json',
      '/brand/rapidrounds-metallic.png',
      '/future-feature',
      '/practice.json',
      '/%2f%2fattacker.example',
      '/%5c%5cattacker.example',
      '/%252f%252fattacker.example',
      '/practice%2f..%2fauth/sign-in',
    ]) {
      expect(safeTesterDestination(value)).toBe('/home')
    }
  })

  it('does not reinterpret URL-shaped query values as navigation targets', () => {
    const destination =
      '/practice?topic=https%3A%2F%2Fexample.com&filter=%2Fcardiac'
    expect(safeTesterDestination(destination)).toBe(destination)
  })

  it('normalizes dot segments before checking the final app destination', () => {
    expect(safeTesterDestination('/practice/../account')).toBe('/account')
    expect(safeTesterDestination('/practice/../auth/sign-in')).toBe('/home')
  })

  it('accepts only bounded strings', () => {
    for (const value of [undefined, null, 1, {}, [], '', 'home']) {
      expect(safeTesterDestination(value)).toBe('/home')
    }
    const bounded = '/practice?x=' + 'a'.repeat(1988)
    expect(bounded).toHaveLength(2000)
    expect(safeTesterDestination(bounded)).toBe(bounded)
    expect(safeTesterDestination(bounded + 'a')).toBe('/home')
  })
})

describe('public tester resources', () => {
  it('allows only the exact public auth page aliases', () => {
    expect(testerPublicPages).toEqual([
      '/tester-login',
      '/auth/sign-in',
      '/auth/callback',
      '/auth',
    ])
    expect(testerPublicPages).not.toContain('/auth/anything')
    expect(testerPublicPages).not.toContain('/tester-login/anything')
  })

  it('permits Next static bundles and the actual public brand assets', () => {
    for (const path of [
      '/_next/static/chunks/app/page.js',
      '/_next/static/css/styles.css',
      '/brand/rapidrounds-metallic.png',
      '/brand/rapidrounds-logo.svg',
      '/favicon.ico',
    ]) {
      expect(isPublicTesterResource(path, '')).toBe(true)
    }
  })

  it('permits image optimization only for one exact approved brand source', () => {
    for (const asset of [
      '/brand/rapidrounds-metallic.png',
      '/brand/rapidrounds-logo.svg',
    ]) {
      const search = new URLSearchParams({ url: asset, w: '256', q: '75' })
      expect(isPublicTesterResource('/_next/image', '?' + search)).toBe(true)
    }
  })

  it('rejects arbitrary, missing, duplicated and double-encoded image sources', () => {
    for (const search of [
      '',
      '?w=256&q=75',
      '?url=https%3A%2F%2Fattacker.example%2Fimage.png&w=256&q=75',
      '?url=%2F%2Fattacker.example%2Fimage.png',
      '?url=%2Fcontent-intake%2Fquestion-template.csv',
      '?url=%252Fbrand%252Frapidrounds-metallic.png',
      '?url=%2Fbrand%2Frapidrounds-metallic.png&url=https%3A%2F%2Fattacker.example',
      '?url=%2Fbrand%2Frapidrounds-metallic.png&url=%2Fbrand%2Frapidrounds-metallic.png',
    ]) {
      expect(isPublicTesterResource('/_next/image', search)).toBe(false)
    }
  })

  it('does not exempt whole directories, future resources or file extensions', () => {
    for (const path of [
      '/_next',
      '/_next/static',
      '/_next/static-other/file.js',
      '/_next/data/build/home.json',
      '/_next/image/extra',
      '/brand',
      '/brand/rapidrounds-intro.mp4',
      '/brand/rapidrounds-metallic.png/extra',
      '/brand-not-public/rapidrounds-metallic.png',
      '/content-intake/question-template.csv',
      '/home.json',
      '/api/metrics/log.json',
      '/future-page.svg',
    ]) {
      expect(isPublicTesterResource(path, '')).toBe(false)
    }
  })
})
