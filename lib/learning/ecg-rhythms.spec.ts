import { describe, expect, it } from 'vitest'
import {
  buildEcgStrip,
  ECG_RHYTHM_IDS,
  ECG_RHYTHMS,
  getEcgRhythm,
} from './ecg-rhythms'

describe('original ECG teaching geometry', () => {
  it('has 17 referenced, deterministic six-second examples at one shared scale', () => {
    expect(ECG_RHYTHMS.map((rhythm) => rhythm.id)).toEqual([...ECG_RHYTHM_IDS])
    expect(new Set(ECG_RHYTHM_IDS).size).toBe(17)
    for (const id of ECG_RHYTHM_IDS) {
      const strip = buildEcgStrip(id)
      expect(buildEcgStrip(id)).toEqual(strip)
      expect(strip).toMatchObject({
        durationSeconds: 6,
        width: 1200,
        height: 320,
      })
      const points = [...strip.path.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)]
      expect(points).toHaveLength(1501)
      expect(Number(points[0]![1])).toBe(0)
      expect(Number(points.at(-1)![1])).toBe(1200)
      for (const point of points)
        expect(Number(point[2])).toBeGreaterThanOrEqual(0)
      expect(strip.path).not.toMatch(/NaN|Infinity/)
      expect(getEcgRhythm(id).sourceUrls.length).toBeGreaterThan(0)
      expect(
        getEcgRhythm(id).sourceUrls.every((source) =>
          source.startsWith('https://')
        )
      ).toBe(true)
    }
  })

  it('measures PR from P onset and retains one-to-one sinus conduction', () => {
    for (const id of [
      'sinus',
      'sinus-brady',
      'sinus-tachy',
      'av-first',
    ] as const) {
      const strip = buildEcgStrip(id)
      const expectedPr = id === 'av-first' ? 0.28 : 0.16
      for (const complex of strip.qrsComplexes) {
        expect(complex.onsetSeconds - complex.conductedPSeconds!).toBeCloseTo(
          expectedPr,
          4
        )
        expect(complex.prSeconds).toBe(expectedPr)
        expect(strip.pWaves).toContain(complex.conductedPSeconds)
      }
    }
  })

  it('illustrates progressive PR before a blocked P wave and reset in Mobitz I', () => {
    const strip = buildEcgStrip('av-mobitz-i')
    expect(
      strip.qrsComplexes.map((complex) => complex.prSeconds).slice(0, 6)
    ).toEqual([0.16, 0.22, 0.28, 0.16, 0.22, 0.28])
    expect(strip.pWaves[3]).toBeCloseTo(2.56)
    expect(
      strip.qrsComplexes.some(
        (complex) => complex.conductedPSeconds === strip.pWaves[3]
      )
    ).toBe(false)
    expect(strip.qrsComplexes[3]!.conductedPSeconds).toBe(strip.pWaves[4])
  })

  it('shows consecutive fixed PR beats around dropped beats rather than isolated 2:1 conduction in Mobitz II', () => {
    const strip = buildEcgStrip('av-mobitz-ii')
    expect(
      strip.qrsComplexes.every((complex) => complex.prSeconds === 0.18)
    ).toBe(true)
    expect(
      strip.qrsComplexes.slice(0, 3).map((complex) => complex.conductedPSeconds)
    ).toEqual(strip.pWaves.slice(0, 3))
    expect(
      strip.qrsComplexes.some(
        (complex) => complex.conductedPSeconds === strip.pWaves[3]
      )
    ).toBe(false)
    expect(strip.qrsComplexes[3]!.conductedPSeconds).toBe(strip.pWaves[4])
  })

  it('keeps the atrial and ventricular clocks independent in complete block', () => {
    const strip = buildEcgStrip('av-complete')
    expect(strip).toMatchObject({ atrialRate: 80, ventricularRate: 32 })
    expect(strip.pWaves[1]! - strip.pWaves[0]!).toBeCloseTo(0.75)
    expect(
      strip.qrsComplexes[1]!.onsetSeconds - strip.qrsComplexes[0]!.onsetSeconds
    ).toBeCloseTo(1.875)
    expect(
      strip.qrsComplexes.every(
        (complex) =>
          complex.prSeconds === undefined &&
          complex.conductedPSeconds === undefined
      )
    ).toBe(true)
  })

  it('gives AF nonrepeating ventricular intervals without organized P waves and makes the rapid example faster', () => {
    for (const id of ['af', 'af-rvr'] as const) {
      const strip = buildEcgStrip(id)
      expect(strip.pWaves).toEqual([])
      const intervals = strip.qrsComplexes
        .slice(1)
        .map((complex, index) =>
          Number(
            (
              complex.onsetSeconds - strip.qrsComplexes[index]!.onsetSeconds
            ).toFixed(2)
          )
        )
      expect(new Set(intervals).size).toBeGreaterThan(4)
      expect(
        strip.qrsComplexes.every((complex) => complex.widthSeconds < 0.12)
      ).toBe(true)
    }
    expect(buildEcgStrip('af-rvr').qrsComplexes.length).toBeGreaterThan(
      buildEcgStrip('af').qrsComplexes.length
    )
  })

  it('never invents a pulse from electrical appearance', () => {
    expect(buildEcgStrip('pea')).toEqual(buildEcgStrip('sinus'))
    expect(buildEcgStrip('pulseless-vt')).toEqual(buildEcgStrip('vt'))
    expect(getEcgRhythm('pea').features.join(' ')).toContain(
      'no unique ECG shape'
    )
    expect(getEcgRhythm('pulseless-vt').features.join(' ')).toContain(
      'never the tracing alone'
    )
    expect(getEcgRhythm('torsades').features.join(' ')).toContain(
      'QT prolongation'
    )
    expect(buildEcgStrip('asystole').qrsComplexes).toEqual([])
    expect(buildEcgStrip('vf').qrsComplexes).toEqual([])
  })
})
