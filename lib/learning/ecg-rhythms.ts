/** Original, deterministic teaching waveforms. They are not patient ECGs. */
export const ECG_RHYTHM_IDS = [
  'sinus',
  'sinus-brady',
  'sinus-tachy',
  'af',
  'af-rvr',
  'flutter',
  'svt',
  'vt',
  'pulseless-vt',
  'vf',
  'torsades',
  'asystole',
  'pea',
  'av-first',
  'av-mobitz-i',
  'av-mobitz-ii',
  'av-complete',
] as const
export type EcgRhythmId = (typeof ECG_RHYTHM_IDS)[number]
export type EcgCategory =
  | 'Sinus'
  | 'Atrial & SVT'
  | 'Ventricular & arrest'
  | 'AV blocks'
export type EcgRhythm = {
  id: EcgRhythmId
  label: string
  category: EcgCategory
  morphology: string
  features: readonly string[]
  pulseContext: string
  clinicalContext: string
  sourceUrls: readonly string[]
}

const ALS =
  'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support'
const AF = 'https://www.jacc.org/doi/10.1016/j.jacc.2023.08.017'
const SVT =
  'https://aci.health.nsw.gov.au/networks/eci/clinical/tools/supraventricular-tachycardia'
const AV = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11317726/'
export const ECG_CALIBRATION_SOURCE =
  'https://www.jacc.org/doi/10.1016/S0735-1097(01)01680-1'
export const ECG_RHYTHMS: readonly EcgRhythm[] = [
  {
    id: 'sinus',
    label: 'Sinus rhythm',
    category: 'Sinus',
    morphology:
      'Regular narrow complexes. A similar upright P wave precedes each QRS with a constant interval.',
    features: [
      'Illustrated rate: 72/min.',
      'One P wave conducts to each QRS; PR 0.16 s and QRS 0.08 s.',
    ],
    pulseContext:
      'An organized strip does not establish a pulse or adequate perfusion.',
    clinicalContext:
      'Interpret the tracing with symptoms, pulse and perfusion.',
    sourceUrls: [ALS],
  },
  {
    id: 'sinus-brady',
    label: 'Sinus bradycardia',
    category: 'Sinus',
    morphology:
      'Slow regular narrow complexes with a similar upright P wave before every QRS.',
    features: [
      'Illustrated rate: 42/min.',
      'P-to-QRS conduction remains one to one.',
    ],
    pulseContext: 'Rate alone does not establish instability.',
    clinicalContext:
      'Assess whether the slow rate accompanies compromised perfusion.',
    sourceUrls: [ALS],
  },
  {
    id: 'sinus-tachy',
    label: 'Sinus tachycardia',
    category: 'Sinus',
    morphology:
      'Fast regular narrow complexes with a similar P wave before every QRS.',
    features: [
      'Illustrated rate: 120/min.',
      'Consistent P waves and PR intervals remain visible.',
    ],
    pulseContext: 'Assess the patient rather than treating a number alone.',
    clinicalContext: 'Consider the cause of a compensatory sinus response.',
    sourceUrls: [SVT],
  },
  {
    id: 'af',
    label: 'Atrial fibrillation',
    category: 'Atrial & SVT',
    morphology:
      'Irregularly spaced narrow complexes, no consistent discrete P waves, and a low-amplitude uneven baseline.',
    features: [
      'R–R intervals vary without a repeating pattern.',
      'No consistent P-to-QRS relationship.',
    ],
    pulseContext:
      'The peripheral pulse may not match every electrical complex.',
    clinicalContext:
      'Assess rate, symptoms, perfusion and the broader clinical context.',
    sourceUrls: [AF],
  },
  {
    id: 'af-rvr',
    label: 'Atrial fibrillation with rapid ventricular response',
    category: 'Atrial & SVT',
    morphology:
      'Rapid irregularly spaced narrow complexes, no consistent discrete P waves, and an uneven baseline.',
    features: [
      'Irregular ventricular response averaging about 150/min in this example.',
      'The rapid response describes the ventricular rate, not a different atrial mechanism.',
    ],
    pulseContext: 'A fast rate can accompany stable or unstable perfusion.',
    clinicalContext:
      'Assess whether symptoms and perfusion demand urgent escalation.',
    sourceUrls: [AF, ALS],
  },
  {
    id: 'flutter',
    label: 'Atrial flutter',
    category: 'Atrial & SVT',
    morphology:
      'Continuous regular sawtooth atrial activity between evenly spaced narrow complexes.',
    features: [
      'Illustrated atrial activity: 300/min with 4:1 conduction.',
      'Ventricular rate: 75/min; conduction ratios can vary in patients.',
    ],
    pulseContext: 'The ventricular response and perfusion matter clinically.',
    clinicalContext:
      'Distinguish atrial activity from the slower ventricular response.',
    sourceUrls: [AF, SVT],
  },
  {
    id: 'svt',
    label: 'Regular narrow-complex SVT',
    category: 'Atrial & SVT',
    morphology:
      'Very rapid regular narrow complexes. Separate P waves are not clearly discernible.',
    features: [
      'Illustrated rate: 180/min.',
      'This limited strip does not identify the exact SVT mechanism.',
    ],
    pulseContext: 'Determine pulse and perfusion before choosing a response.',
    clinicalContext:
      'Use the patient assessment and a 12-lead ECG when available.',
    sourceUrls: [SVT, ALS],
  },
  {
    id: 'vt',
    label: 'Monomorphic ventricular tachycardia',
    category: 'Ventricular & arrest',
    morphology:
      'Rapid regular broad complexes with a similar shape and no clear preceding P waves.',
    features: [
      'Illustrated rate: 180/min and QRS width 0.16 s.',
      'The electrical appearance cannot establish a pulse.',
    ],
    pulseContext: 'Pulse status must come from the patient assessment.',
    clinicalContext:
      'A pulse and signs of instability change the response pathway.',
    sourceUrls: [ALS],
  },
  {
    id: 'pulseless-vt',
    label: 'Pulseless ventricular tachycardia',
    category: 'Ventricular & arrest',
    morphology:
      'Rapid regular broad complexes with a similar shape and no clear preceding P waves.',
    features: [
      'Same electrical example as monomorphic VT.',
      'Pulselessness is supplied by the clinical assessment, never the tracing alone.',
    ],
    pulseContext:
      'Teaching context: unresponsive, no normal breathing, and no definite pulse on a brief assessment.',
    clinicalContext:
      'Combine the arrest assessment with the shockable electrical pattern.',
    sourceUrls: [ALS],
  },
  {
    id: 'vf',
    label: 'Ventricular fibrillation',
    category: 'Ventricular & arrest',
    morphology:
      'Chaotic continuously changing deflections without organized QRS complexes.',
    features: [
      'No measurable organized ventricular rate.',
      'Amplitude and direction change throughout the illustration.',
    ],
    pulseContext: 'Assess the patient and exclude obvious artifact promptly.',
    clinicalContext:
      'Recognize the arrest pattern without waiting for a precise rate.',
    sourceUrls: [ALS],
  },
  {
    id: 'torsades',
    label: 'Torsades de pointes',
    category: 'Ventricular & arrest',
    morphology:
      'Rapid broad complexes with changing polarity and waxing and waning amplitude around the baseline.',
    features: [
      'Illustrates a polymorphic ventricular pattern.',
      'The torsades label also requires known or suspected QT prolongation outside the tachycardia.',
    ],
    pulseContext:
      'Assess pulse and instability; the strip alone cannot establish perfusion.',
    clinicalContext:
      'Teaching context includes a preceding prolonged QT; not every polymorphic VT is torsades.',
    sourceUrls: [ALS],
  },
  {
    id: 'asystole',
    label: 'Asystole',
    category: 'Ventricular & arrest',
    morphology:
      'Near-flat baseline without discernible P waves or QRS complexes.',
    features: [
      'No organized electrical complexes in this example.',
      'A disconnected lead or gain setting can also create an apparently flat display.',
    ],
    pulseContext:
      'Assess arrest and verify leads and another view without delaying resuscitation.',
    clinicalContext:
      'Pair the clinical assessment with confirmation of the tracing.',
    sourceUrls: [ALS],
  },
  {
    id: 'pea',
    label: 'Pulseless electrical activity (PEA)',
    category: 'Ventricular & arrest',
    morphology:
      'Regular narrow complexes. A similar upright P wave precedes each QRS with a constant interval.',
    features: [
      'Same organized electrical example as the sinus illustration.',
      'PEA is a clinical state; it has no unique ECG shape.',
    ],
    pulseContext:
      'Teaching context: unresponsive, no normal breathing, and no definite pulse on a brief assessment.',
    clinicalContext:
      'Electrical organization does not prove mechanical circulation.',
    sourceUrls: [ALS],
  },
  {
    id: 'av-first',
    label: 'First-degree AV block',
    category: 'AV blocks',
    morphology:
      'Regular narrow complexes, each preceded by a P wave with a consistently prolonged interval.',
    features: [
      'One-to-one conduction with PR 0.28 s in this example.',
      'PR is measured from P-wave onset to QRS onset; first degree exceeds 0.20 s.',
    ],
    pulseContext: 'Assess the patient and medication context.',
    clinicalContext:
      'All P waves conduct here; the delay is not a dropped beat.',
    sourceUrls: [AV],
  },
  {
    id: 'av-mobitz-i',
    label: 'Second-degree AV block · Mobitz I',
    category: 'AV blocks',
    morphology:
      'Regular P waves with grouped narrow complexes. The P-to-QRS interval increases before a P wave is not followed by a QRS.',
    features: [
      'PR sequence: 0.16, 0.22, 0.28 s, then a nonconducted P wave.',
      'The next conducted PR returns to the shorter interval.',
    ],
    pulseContext:
      'Assess symptoms and perfusion as well as the conduction pattern.',
    clinicalContext:
      'Follow consecutive P waves rather than just counting ventricular complexes.',
    sourceUrls: [AV],
  },
  {
    id: 'av-mobitz-ii',
    label: 'Second-degree AV block · Mobitz II',
    category: 'AV blocks',
    morphology:
      'Regular P waves with intermittent absent QRS complexes. Conducted beats have an unchanged P-to-QRS interval.',
    features: [
      'Conducted PR: 0.18 s; every fourth P wave is blocked in this example.',
      'Consecutive conducted beats show the fixed PR before and after a blocked beat; an isolated 2:1 pattern is insufficient to classify type.',
    ],
    pulseContext:
      'Assess for deterioration and escalate promptly when clinically indicated.',
    clinicalContext:
      'A fixed conducted PR with dropped beats differs from progressive PR lengthening.',
    sourceUrls: [AV],
  },
  {
    id: 'av-complete',
    label: 'Third-degree (complete) AV block',
    category: 'AV blocks',
    morphology:
      'Regular P waves and slower regular broad complexes proceed independently with no fixed P-to-QRS relationship.',
    features: [
      'Illustrated atrial rate: 80/min; ventricular escape: 32/min.',
      'Apparent PR intervals vary because the atria and ventricles are dissociated.',
    ],
    pulseContext: 'The slow escape may compromise perfusion.',
    clinicalContext:
      'The key is independent atrial and ventricular activity, not a single long PR.',
    sourceUrls: [AV],
  },
]

export function getEcgRhythm(id: EcgRhythmId): EcgRhythm {
  return ECG_RHYTHMS.find((rhythm) => rhythm.id === id)!
}
export type EcgComplex = {
  onsetSeconds: number
  widthSeconds: number
  conductedPSeconds?: number
  prSeconds?: number
}
export type EcgStripGeometry = {
  durationSeconds: 6
  width: 1200
  height: 320
  path: string
  pWaves: number[]
  qrsComplexes: EcgComplex[]
  atrialRate?: number
  ventricularRate?: number
}

const DURATION = 6
const regular = (period: number, start = 0.16) => {
  const result: number[] = []
  for (let time = start; time < DURATION; time += period)
    result.push(Number(time.toFixed(5)))
  return result
}
const round = (value: number) => Number(value.toFixed(5))
const wave = (
  time: number,
  start: number,
  duration: number,
  amplitude: number
) =>
  time >= start && time <= start + duration
    ? amplitude * Math.sin((Math.PI * (time - start)) / duration) ** 2
    : 0

/** QRS samples are points in seconds / mV, not decorative sine-wave peaks. */
function complexVoltage(offset: number, width: number): number {
  const points =
    width > 0.12
      ? [
          [0, 0],
          [0.15, -0.17],
          [0.48, 1.2],
          [0.85, -0.35],
          [1, 0],
        ]
      : [
          [0, 0],
          [0.12, -0.12],
          [0.4, 1],
          [0.74, -0.28],
          [1, 0],
        ]
  const phase = offset / width
  if (phase < 0 || phase > 1) return 0
  for (let index = 1; index < points.length; index++) {
    const [end, y2] = points[index]!
    const [start, y1] = points[index - 1]!
    if (phase <= end!)
      return y1! + ((y2! - y1!) * (phase - start!)) / (end! - start!)
  }
  return 0
}

export function buildEcgStrip(id: EcgRhythmId): EcgStripGeometry {
  // A pulse cannot change the electrical geometry of the same example.
  const electricalId =
    id === 'pea' ? 'sinus' : id === 'pulseless-vt' ? 'vt' : id
  const pWaves: number[] = []
  const qrsComplexes: EcgComplex[] = []
  let atrialRate: number | undefined
  let ventricularRate: number | undefined
  const conducted = (p: number, pr: number, width = 0.08) => {
    pWaves.push(p)
    if (p + pr < DURATION)
      qrsComplexes.push({
        onsetSeconds: round(p + pr),
        widthSeconds: width,
        conductedPSeconds: p,
        prSeconds: pr,
      })
  }
  if (
    ['sinus', 'sinus-brady', 'sinus-tachy', 'av-first'].includes(electricalId)
  ) {
    atrialRate =
      electricalId === 'sinus-brady'
        ? 42
        : electricalId === 'sinus-tachy'
          ? 120
          : 72
    ventricularRate = atrialRate
    regular(60 / atrialRate).forEach((p) =>
      conducted(p, electricalId === 'av-first' ? 0.28 : 0.16)
    )
  } else if (
    electricalId === 'av-mobitz-i' ||
    electricalId === 'av-mobitz-ii'
  ) {
    atrialRate = 75
    regular(0.8).forEach((p, index) => {
      if (index % 4 === 3) pWaves.push(p)
      else
        conducted(
          p,
          electricalId === 'av-mobitz-i' ? [0.16, 0.22, 0.28][index % 4]! : 0.18
        )
    })
  } else if (electricalId === 'av-complete') {
    atrialRate = 80
    ventricularRate = 32
    pWaves.push(...regular(0.75, 0.12))
    qrsComplexes.push(
      ...regular(60 / 32, 0.5).map((onsetSeconds) => ({
        onsetSeconds,
        widthSeconds: 0.16,
      }))
    )
  } else if (electricalId === 'af' || electricalId === 'af-rvr') {
    const intervals =
      electricalId === 'af'
        ? [0.72, 1.02, 0.57, 0.88, 0.64, 0.91, 0.55, 0.79]
        : [
            0.34, 0.47, 0.3, 0.43, 0.36, 0.52, 0.32, 0.41, 0.29, 0.46, 0.34,
            0.39, 0.48,
          ]
    let time = 0.18
    let index = 0
    while (time < DURATION) {
      qrsComplexes.push({ onsetSeconds: round(time), widthSeconds: 0.08 })
      time += intervals[index++ % intervals.length]!
    }
  } else if (
    electricalId === 'flutter' ||
    electricalId === 'svt' ||
    electricalId === 'vt' ||
    electricalId === 'torsades'
  ) {
    ventricularRate =
      electricalId === 'flutter' ? 75 : electricalId === 'torsades' ? 226 : 180
    if (electricalId === 'flutter') atrialRate = 300
    qrsComplexes.push(
      ...regular(60 / ventricularRate, 0.24).map((onsetSeconds) => ({
        onsetSeconds,
        widthSeconds:
          electricalId === 'vt'
            ? 0.16
            : electricalId === 'torsades'
              ? 0.21
              : 0.08,
      }))
    )
  }
  const samples: string[] = []
  for (let sample = 0; sample <= DURATION * 250; sample++) {
    const time = sample / 250
    let voltage = 0
    if (electricalId === 'vf')
      voltage =
        0.42 *
          Math.sin(
            2 * Math.PI * 4.7 * time + 0.65 * Math.sin(2 * Math.PI * 0.8 * time)
          ) +
        0.21 * Math.sin(2 * Math.PI * 7.9 * time + 0.4) +
        0.12 * Math.sin(2 * Math.PI * 11.3 * time)
    else if (electricalId === 'asystole')
      voltage = 0.003 * Math.sin(2 * Math.PI * 1.3 * time)
    else {
      if (electricalId === 'af' || electricalId === 'af-rvr')
        voltage +=
          0.025 * Math.sin(2 * Math.PI * 6.8 * time) +
          0.019 * Math.sin(2 * Math.PI * 9.7 * time + 0.6)
      if (electricalId === 'flutter') {
        const phase = ((time + 0.04) % 0.2) / 0.2
        voltage +=
          phase < 0.85
            ? 0.16 - (0.32 * phase) / 0.85
            : -0.16 + (0.32 * (phase - 0.85)) / 0.15
      }
      for (const p of pWaves) voltage += wave(time, p, 0.08, 0.14)
      for (const complex of qrsComplexes) {
        const qrs = complexVoltage(
          time - complex.onsetSeconds,
          complex.widthSeconds
        )
        if (electricalId === 'torsades') {
          const twist = Math.sin((2 * Math.PI * complex.onsetSeconds) / 2.4)
          voltage += qrs * twist
        } else {
          voltage += qrs
          if (electricalId !== 'vt')
            voltage += wave(
              time,
              complex.onsetSeconds + 0.18,
              electricalId === 'sinus-tachy' || electricalId === 'svt'
                ? 0.12
                : 0.16,
              0.2
            )
          else voltage -= wave(time, complex.onsetSeconds + 0.18, 0.12, 0.2)
        }
      }
    }
    samples.push(
      `${sample === 0 ? 'M' : 'L'}${(time * 200).toFixed(2)},${(160 - voltage * 80).toFixed(2)}`
    )
  }
  return {
    durationSeconds: 6,
    width: 1200,
    height: 320,
    path: samples.join(' '),
    pWaves,
    qrsComplexes,
    ...(atrialRate === undefined ? {} : { atrialRate }),
    ...(ventricularRate === undefined ? {} : { ventricularRate }),
  }
}
