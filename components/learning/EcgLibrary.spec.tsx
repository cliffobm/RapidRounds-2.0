import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import EcgStrip from './EcgStrip'
import EcgLibrary from './EcgLibrary'

describe('ECG teaching interface', () => {
  it('offers a complete rhythm overview and an explicit enlarged interval view', () => {
    render(<EcgStrip rhythmId="av-mobitz-i" />)
    const region = screen.getByRole('region', { name: 'ECG strip waveform' })
    expect(region).toHaveAttribute('data-enlarged', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge ECG strip' }))
    expect(region).toHaveAttribute('data-enlarged', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Fit whole ECG strip' }))
    expect(region).toHaveAttribute('data-enlarged', 'false')
  })
  it('conceals diagnoses in assessment labels while exposing equivalent morphology and calibration', () => {
    const view = render(<EcgStrip rhythmId="af-rvr" />)
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /^ECG strip Rapid irregularly spaced narrow complexes/
    )
    expect(view.container.textContent).not.toMatch(
      /atrial fibrillation|rapid ventricular response|af-rvr/i
    )
    expect(
      screen.getByText('6 seconds · 25 mm/s · 10 mm/mV')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'ECG strip waveform' })
    ).toHaveAttribute('tabindex', '0')
    expect(view.container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      '0 0 1200 320'
    )
  })

  it('uses separate SVG and accessible-description identifiers for every rendered strip', () => {
    const view = render(
      <>
        <EcgStrip rhythmId="sinus" />
        <EcgStrip rhythmId="vt" />
      </>
    )
    const ids = [...view.container.querySelectorAll('[id]')].map(
      (node) => node.id
    )
    expect(new Set(ids).size).toBe(ids.length)
    for (const graphic of view.container.querySelectorAll('svg')) {
      const names = graphic.getAttribute('aria-labelledby')!.split(' ')
      expect(
        names.every((id) => view.container.querySelector(`[id="${id}"]`))
      ).toBe(true)
    }
  })

  it('reveals library diagnoses, filters by category and search, and explains the pulse requirement', () => {
    render(<EcgLibrary />)
    expect(screen.getByRole('status')).toHaveTextContent('17 of 17 examples')
    expect(
      screen.getByRole('heading', {
        name: 'Pulseless electrical activity (PEA)',
      })
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'AV blocks', exact: true })
    )
    expect(
      screen.getByRole('button', { name: 'AV blocks', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('4 of 17 examples')
    expect(
      screen.queryByRole('heading', { name: 'Sinus rhythm' })
    ).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Find a rhythm' }), {
      target: { value: 'Mobitz II' },
    })
    expect(screen.getByRole('status')).toHaveTextContent('1 of 17 examples')
    expect(
      screen.getByRole('heading', {
        name: 'Second-degree AV block · Mobitz II',
      })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'All', exact: true }))
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'pea' },
    })
    expect(screen.getByRole('status')).toHaveTextContent('1 of 17 examples')
    expect(
      screen.getByText('PEA is a clinical state; it has no unique ECG shape.')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Electrical organization does not prove mechanical circulation.'
      )
    ).toBeInTheDocument()
  })

  it('shows a useful empty state without removing the search controls', () => {
    render(<EcgLibrary />)
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'unmatched search' },
    })
    expect(screen.getByRole('status')).toHaveTextContent('0 of 17 examples')
    expect(
      screen.getByText('No rhythms match. Try a different term or select All.')
    ).toBeInTheDocument()
  })
})
