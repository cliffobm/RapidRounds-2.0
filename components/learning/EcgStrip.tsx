'use client'

import { useId, useMemo, useState } from 'react'
import {
  buildEcgStrip,
  getEcgRhythm,
  type EcgRhythmId,
} from '@/lib/learning/ecg-rhythms'

export type EcgStripProps = {
  rhythmId: EcgRhythmId
  /** Assessment views conceal the diagnosis in visible and accessible labels. */
  concealLabel?: boolean
  caption?: string
}

export default function EcgStrip({
  rhythmId,
  concealLabel = true,
  caption,
}: EcgStripProps) {
  const prefix = `ecg-${useId().replace(/:/g, '')}`
  const [enlarged, setEnlarged] = useState(false)
  const geometry = useMemo(() => buildEcgStrip(rhythmId), [rhythmId])
  const rhythm = getEcgRhythm(rhythmId)
  const label = concealLabel ? 'ECG strip' : rhythm.label
  return (
    <figure className="ecg-strip" data-testid="ecg-strip">
      <div className="ecg-strip-heading">
        <strong>{label}</strong>
        <span>6 seconds · 25 mm/s · 10 mm/mV</span>
      </div>
      <button
        className="ecg-enlarge"
        type="button"
        aria-expanded={enlarged}
        aria-controls={`${prefix}-waveform`}
        onClick={() => setEnlarged(!enlarged)}
      >
        {enlarged ? 'Fit whole ECG strip' : 'Enlarge ECG strip'}
      </button>
      <p className="ecg-scroll-hint" id={`${prefix}-scroll`}>
        {enlarged
          ? 'Scroll horizontally to inspect all 6 seconds. '
          : 'Whole six-second view. Enlarge to inspect intervals. '}
        Small square: 0.04 s × 0.1 mV.
      </p>
      <div
        className="ecg-strip-scroll"
        id={`${prefix}-waveform`}
        data-enlarged={enlarged}
        role="region"
        aria-label={`${label} waveform`}
        aria-describedby={`${prefix}-scroll`}
        tabIndex={0}
      >
        <svg
          viewBox="0 0 1200 320"
          width="1200"
          height="320"
          role="img"
          aria-labelledby={`${prefix}-title ${prefix}-description`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id={`${prefix}-title`}>{label}</title>
          <desc id={`${prefix}-description`}>
            {rhythm.morphology} Six-second synthetic teaching illustration.
            Horizontal time marks are one second apart; the vertical calibration
            marker represents one millivolt. Pulse and perfusion cannot be
            established from this illustration.
          </desc>
          <defs>
            <pattern
              id={`${prefix}-small`}
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M8 0H0V8"
                fill="none"
                stroke="#ecc5cc"
                strokeWidth="0.6"
              />
            </pattern>
            <pattern
              id={`${prefix}-large`}
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="40" fill={`url(#${prefix}-small)`} />
              <path
                d="M40 0H0V40"
                fill="none"
                stroke="#c5798a"
                strokeWidth="0.9"
              />
            </pattern>
            <clipPath id={`${prefix}-clip`}>
              <rect x="0" y="0" width="1200" height="320" />
            </clipPath>
          </defs>
          <rect width="1200" height="320" fill="#fff8f9" />
          <rect width="1200" height="320" fill={`url(#${prefix}-large)`} />
          <path
            d={geometry.path}
            fill="none"
            stroke="#112536"
            strokeWidth="2.2"
            strokeLinejoin="round"
            clipPath={`url(#${prefix}-clip)`}
          />
          <g
            aria-hidden="true"
            fill="#112536"
            fontFamily="system-ui, sans-serif"
            fontSize="16"
            fontWeight="600"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((second) => (
              <g key={second}>
                <path
                  d={`M${second * 200} 0v14`}
                  stroke="#112536"
                  strokeWidth="2"
                />
                <text
                  x={second === 6 ? 1192 : second * 200 + 8}
                  y="32"
                  textAnchor={second === 6 ? 'end' : 'start'}
                >
                  {second} s
                </text>
              </g>
            ))}
            <rect
              x="14"
              y="212"
              width="96"
              height="94"
              fill="#fff8f9"
              fillOpacity="0.95"
              rx="4"
            />
            <path
              d="M28 292h8v-80h16v80h8"
              fill="none"
              stroke="#112536"
              strokeWidth="2"
            />
            <text x="66" y="258">
              1 mV
            </text>
          </g>
        </svg>
      </div>
      <figcaption>
        {caption ??
          'Original synthetic teaching illustration · Not a diagnostic ECG · Clinical review pending'}
      </figcaption>
    </figure>
  )
}
