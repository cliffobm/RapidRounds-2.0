export const contentSources = {
  meningitis: {
    title: 'NICE NG240: bacterial meningitis recognition and management',
    url: 'https://www.nice.org.uk/guidance/ng240/chapter/Recommendations',
    section: 'Recognition, urgent response and timing of investigations',
  },
  pancreatitis: {
    title: 'NICE NG104: pancreatitis',
    url: 'https://www.nice.org.uk/guidance/ng104/chapter/recommendations',
    section: 'Assessment, individualized fluids, nutrition and complications',
  },
  cellulitis: {
    title: 'NICE NG141: cellulitis reassessment',
    url: 'https://www.nice.org.uk/guidance/ng141/chapter/Recommendations',
    section: '1.1.9–1.1.14: worsening symptoms, alternatives and referral',
  },
  vte: {
    title: 'NICE NG158: venous thromboembolic disease',
    url: 'https://www.nice.org.uk/guidance/ng158/chapter/Recommendations',
    section: 'Assessment of suspected DVT/PE and patient information',
  },
  appendicitis: {
    title: 'NHS: appendicitis',
    url: 'https://www.nhs.uk/conditions/appendicitis/',
    section: 'Changing symptoms, assessment and complications',
  },
  coeliac: {
    title: 'NICE NG20: coeliac disease',
    url: 'https://www.nice.org.uk/guidance/ng20/chapter/Recommendations',
    section: 'Testing context, specialist confirmation and dietary review',
  },
  sharedDecisions: {
    title: 'NICE NG197: shared decision making',
    url: 'https://www.nice.org.uk/guidance/ng197/chapter/Recommendations',
    section: '1.2: priorities, uncertainty, preferences and teach-back',
  },
  deterioration: {
    title: 'NICE CG50: recognising deterioration',
    url: 'https://www.nice.org.uk/guidance/cg50/chapter/recommendations',
    section: '1.1–1.11: observation, clinical concern and graded response',
  },
  sepsis: {
    title: 'NICE NG253: suspected sepsis',
    url: 'https://www.nice.org.uk/guidance/ng253/chapter/Managing-suspected-sepsis',
    section: 'Risk-based assessment and reassessment; apply local pathways',
  },
  acs: {
    title: 'AHA: 2025 acute coronary syndromes guideline resources',
    url: 'https://professional.heart.org/en/science-news/patient-resources/key-patient-messages-2025-acute-coronary-syndromes-guideline',
    section: 'Symptoms, timing, ECG and blood tests',
  },
  stroke: {
    title: 'American Stroke Association: stroke symptoms',
    url: 'https://www.stroke.org/en/about-stroke/stroke-symptoms',
    section: 'Sudden focal symptoms and urgent response',
  },
  strokeTiming: {
    title: 'AHA stroke quality program: last known well and discovery time',
    url: 'https://www.stroke.org/-/media/files/professional/quality-improvement/get-with-the-guidelines/get-with-the-guidelines-stroke/workshops-and-webinars/ml-stroke-call-to-action-may-2019--v3.pdf?la=en',
    section:
      'Documentation of time LKW or symptom discovery; the two times are distinct',
  },
  fluids: {
    title: 'NICE CG174: adult fluid assessment',
    url: 'https://www.nice.org.uk/guidance/cg174/chapter/recommendations',
    section: '1.2: history, losses, examination, monitoring and reassessment',
  },
  oximetry: {
    title: 'FDA: pulse oximeter basics',
    url: 'https://www.fda.gov/consumers/consumer-updates/pulse-oximeters-and-oxygen-concentrators-what-know-about-home-oxygen-therapy',
    section: 'Measurement limitations and interpretation with symptoms',
  },
  auscultation: {
    title: 'Merck Manual Professional: cardiac auscultation',
    url: 'https://www.merckmanuals.com/professional/cardiovascular-disorders/approach-to-the-cardiac-patient/cardiac-auscultation',
    section: 'Heart sounds and murmurs; interpretation with other findings',
  },
  anaphylaxis: {
    title: 'Resuscitation Council UK: 2025 special circumstances',
    url: 'https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/special-circumstances-guidelines',
    section: 'Anaphylaxis recognition; airway, breathing and circulation',
  },
  reasoning: {
    title: 'AHRQ PSNet: diagnostic errors',
    url: 'https://psnet.ahrq.gov/primer/diagnostic-errors',
    section: 'Cognitive factors in diagnostic reasoning',
  },
  vitals: {
    title: 'MedlinePlus: vital signs',
    url: 'https://medlineplus.gov/ency/article/002341.htm',
    section: 'Example resting-adult ranges; publisher review January 2025',
  },
  sodium: {
    title: 'MedlinePlus: sodium blood test',
    url: 'https://medlineplus.gov/ency/article/003481.htm',
    section: 'Normal results and laboratory variation',
  },
  chemistry: {
    title: 'MedlinePlus: basic metabolic panel',
    url: 'https://medlineplus.gov/ency/article/003462.htm',
    section: 'Normal results and units; publisher review May 2025',
  },
} as const
export type SourceId = keyof typeof contentSources
export const expansionRevision = '2026-10-17.2'
