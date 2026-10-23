import { describe, expect, it } from 'vitest'
import { buildEcgStrip, ECG_RHYTHMS } from './ecg-rhythms'
import { getRapidResponseCase, rapidResponseCases, rapidResponseClinicalScope, rapidResponseRevision } from './rapid-response-content'

describe('Rapid Response teaching content', () => {
  it('provides six complete, distinct adult cases and 24 sequential decisions', () => {
    expect(rapidResponseRevision).toBe('2026-10-23.1')
    expect(rapidResponseClinicalScope).toMatch(/not clinical deadlines/i)
    expect(rapidResponseCases).toHaveLength(6)
    expect(new Set(rapidResponseCases.map((item) => item.id)).size).toBe(6)
    const prompts: string[] = []
    for (const item of rapidResponseCases) {
      expect(item.title.length).toBeGreaterThan(8)
      expect(item.summary.length).toBeGreaterThan(40)
      expect(item.stages).toHaveLength(4)
      expect(new Set(item.stages.map((stage) => stage.id)).size).toBe(4)
      expect(item.timeBudgetSeconds).toBeGreaterThanOrEqual(240)
      expect(item.timeBudgetSeconds).toBeLessThanOrEqual(360)
      expect(item.stages.filter((stage) => stage.critical).length).toBeGreaterThanOrEqual(2)
      expect(item.references.length).toBeGreaterThanOrEqual(2)
      for (const reference of item.references) {
        expect(reference.title.length).toBeGreaterThan(12)
        expect(new URL(reference.url).protocol).toBe('https:')
      }
      for (const stage of item.stages) {
        expect(stage.update.length).toBeGreaterThan(80)
        expect(stage.observations.length).toBeGreaterThanOrEqual(3)
        const question = stage.question
        prompts.push(question.prompt)
        expect(question.options).toHaveLength(4)
        expect(question.correct).toHaveLength(1)
        expect(new Set(question.options.map((option) => option.id)).size).toBe(4)
        expect(question.options.map((option) => option.id)).toEqual(['0', '1', '2', '3'])
        expect(question.options.some((option) => option.id === question.correct[0])).toBe(true)
        expect(new Set(question.options.map((option) => option.text)).size).toBe(4)
        for (const option of question.options) {
          expect(option.text.length).toBeGreaterThan(20)
          expect(option.explanation.length).toBeGreaterThan(100)
        }
        expect(question.reflection.length).toBeGreaterThan(80)
      }
    }
    expect(prompts).toHaveLength(24)
    expect(new Set(prompts).size).toBe(24)
  })

  it('uses supported rhythm identifiers and bedside context rather than diagnosing pulse from the strip', () => {
    const rhythmIds = new Set(ECG_RHYTHMS.map((item) => item.id))
    for (const stage of rapidResponseCases.flatMap((item) => item.stages)) {
      if (stage.rhythmId) {
        expect(rhythmIds.has(stage.rhythmId)).toBe(true)
        expect(stage.pulseContext?.length).toBeGreaterThan(30)
      }
      if (stage.rhythmId === 'pulseless-vt' || stage.rhythmId === 'pea') {
        expect(stage.pulseContext).toMatch(/no definite central pulse/i)
        expect(stage.critical).toBe(true)
      }
      if (stage.rhythmId === 'vt') {
        expect(stage.pulseContext).toMatch(/pulse is palpable/i)
      }
    }
    const arrest = getRapidResponseCase('wide-complex-collapse')!
    expect(arrest.stages.map((stage) => stage.rhythmId ?? null)).toEqual(['vt', 'pulseless-vt', null, 'pea'])
    expect(getRapidResponseCase('potassium-warning')!.stages.every((stage) => !stage.rhythmId)).toBe(true)
  })

  it('keeps displayed case rates consistent with the fixed synthetic teaching strips', () => {
    for (const stage of rapidResponseCases.flatMap((item) => item.stages)) {
      if (!stage.rhythmId) continue
      const caseInformation = `${stage.update} ${stage.observations.join(' ')}`
      if (stage.rhythmId === 'af-rvr') {
        expect(caseInformation).toMatch(/averaging about 150\/min/)
      } else if (stage.rhythmId !== 'pulseless-vt') {
        const illustratedRate = buildEcgStrip(stage.rhythmId).ventricularRate
        expect(illustratedRate).toBeDefined()
        expect(caseInformation).toContain(`${illustratedRate}/min`)
      }
    }
  })

  it('distributes answer positions and retains clinical distinctions that change the action', () => {
    const answerCounts = [0, 0, 0, 0]
    for (const stage of rapidResponseCases.flatMap((item) => item.stages)) {
      answerCounts[Number(stage.question.correct[0])]! += 1
    }
    expect(answerCounts).toEqual([6, 6, 6, 6])

    const correctText = (caseId: string, stageId: string) => {
      const question = getRapidResponseCase(caseId)!.stages.find((stage) => stage.id === stageId)!.question
      return question.options.find((option) => option.id === question.correct[0])!.text
    }
    expect(correctText('wide-complex-collapse', 'pulse-present')).toMatch(/synchronized cardioversion/i)
    expect(correctText('wide-complex-collapse', 'pulse-lost')).toMatch(/CPR.*unsynchronized defibrillation/i)
    expect(correctText('wide-complex-collapse', 'organized-rhythm')).toMatch(/CPR.*nonshockable/i)
    expect(correctText('slowing-conduction', 'capture')).toMatch(/mechanical capture/i)
    expect(correctText('potassium-warning', 'stabilize-and-remove')).toMatch(/protects.*potassium lowering/i)
    expect(correctText('potassium-warning', 'second-risk')).toMatch(/glucose/i)
    expect(correctText('hidden-loss', 'drain-stops')).toMatch(/Internal blood loss.*absent drain output/i)
    expect(correctText('breathless-infection', 'fluid-tolerance')).toMatch(/fluid-tolerance/i)
    expect(getRapidResponseCase('missing-case')).toBeUndefined()
  })
})
