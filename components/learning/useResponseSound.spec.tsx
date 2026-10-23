import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useResponseSound } from './useResponseSound'

let audio: MockAudio
class MockAudio {
  state = 'suspended'
  currentTime = 0
  destination = {}
  gainValues: number[] = []
  createOscillator = vi.fn(() => ({
    type: '',
    frequency: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  }))
  createGain = vi.fn(() => ({
    gain: {
      setValueAtTime: (value: number) => this.gainValues.push(value),
      linearRampToValueAtTime: (value: number) => this.gainValues.push(value),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }))
  resume = vi.fn(async () => {
    this.state = 'running'
  })
  close = vi.fn(async () => {
    this.state = 'closed'
  })
  constructor() {
    audio = this
  }
}
beforeEach(() => {
  vi.stubGlobal('AudioContext', MockAudio)
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  vi.spyOn(performance, 'now').mockReturnValue(10000)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
describe('optional bounded monitor cue', () => {
  it('requires explicit enabling, caps amplitude, throttles cues and closes on disable', async () => {
    const { result } = renderHook(() => useResponseSound())
    expect(result.current.enabled).toBe(false)
    await act(async () => {
      await result.current.enable()
    })
    expect(result.current.enabled).toBe(true)
    act(() => result.current.setVolume(1))
    act(() => {
      result.current.pulse(2)
      result.current.pulse(2)
    })
    expect(audio.createOscillator).toHaveBeenCalledTimes(1)
    expect(Math.max(...audio.gainValues)).toBeLessThanOrEqual(0.12)
    act(() => result.current.disable())
    expect(audio.close).toHaveBeenCalledTimes(1)
    expect(result.current.enabled).toBe(false)
  })
  it('turns off on backgrounding and does not enable automatically on return', async () => {
    const { result } = renderHook(() => useResponseSound())
    await act(async () => {
      await result.current.enable()
    })
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.enabled).toBe(false)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.enabled).toBe(false)
    act(() => result.current.pulse(2))
    expect(audio.createOscillator).not.toHaveBeenCalled()
  })
  it('keeps the activity usable when browser audio is unavailable', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const { result } = renderHook(() => useResponseSound())
    await act(async () => {
      await result.current.enable()
    })
    expect(result.current.enabled).toBe(false)
    expect(result.current.error).toContain('visual timer still works')
  })
  it('contains a runtime audio failure without interrupting the activity', async () => {
    const { result } = renderHook(() => useResponseSound())
    await act(async () => {
      await result.current.enable()
    })
    audio.createOscillator.mockImplementation(() => {
      throw new Error('audio device removed')
    })
    act(() => result.current.pulse(2))
    expect(result.current.enabled).toBe(false)
    expect(result.current.error).toContain('visual timer still works')
  })
})
