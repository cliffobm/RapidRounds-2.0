// AI Content Generation Prompts for Nursing Education

export const SYSTEM_PROMPT = `You are an evidence-focused nursing item writer. Produce NCLEX-style items and short scenarios for {CATEGORY} at {LEVEL} difficulty. For each item: include STEM, 4–5 OPTIONS, CORRECT_ANSWER key, and a RATIONALE that explains why the correct option is correct and why each distractor is wrong. End the rationale with 2–3 APA-style references from the last 5–7 years (guidelines or textbooks acceptable). Avoid hallucinations by only citing real, checkable sources. If you are unsure, say "INSUFFICIENT EVIDENCE".

Output strict JSONL, one item per line, fields:
{ 
  "category": "{CATEGORY}",
  "scenario_title": "{TITLE}",
  "question_type": "single|multi|order",
  "prompt": "...",
  "options": ["A ...","B ...","C ...","D ..."],
  "correct": ["B"],      // for order type, include array in correct order
  "rationale": "Why correct; why others aren't. <citations>"
}

Constraints:
- 30% should be PRIORITY/ASSESSMENT items.
- Include at least 1 ORDER question per scenario (for drag-and-drop).
- Reading level: professional but concise.
- Avoid brand names; use generic meds.
- No PHI or institutional details.`

export const CATEGORY_PROMPTS = {
  cardiovascular: {
    title: "Cardiovascular System",
    description: "Heart, blood vessels, circulation, cardiac conditions",
    scenarios: [
      "Acute Myocardial Infarction",
      "Heart Failure Management", 
      "Arrhythmia Recognition",
      "Hypertensive Crisis",
      "Cardiogenic Shock"
    ],
    keyTopics: [
      "ECG interpretation",
      "Cardiac medications",
      "Hemodynamic monitoring",
      "Cardiac assessment",
      "Emergency interventions"
    ]
  },
  respiratory: {
    title: "Respiratory System", 
    description: "Lungs, breathing, oxygenation, pulmonary conditions",
    scenarios: [
      "Acute Respiratory Distress",
      "COPD Exacerbation",
      "Pneumonia Management",
      "Asthma Attack",
      "Pulmonary Embolism"
    ],
    keyTopics: [
      "Oxygen therapy",
      "Ventilator management",
      "Respiratory assessment",
      "Airway management",
      "Pulmonary medications"
    ]
  },
  gastrointestinal: {
    title: "Gastrointestinal System",
    description: "Digestive system, liver, GI conditions",
    scenarios: [
      "GI Bleed Management",
      "Liver Failure",
      "Bowel Obstruction", 
      "Pancreatitis",
      "Inflammatory Bowel Disease"
    ],
    keyTopics: [
      "GI assessment",
      "Nutrition support",
      "Fluid/electrolyte balance",
      "GI medications",
      "Surgical interventions"
    ]
  },
  endocrine: {
    title: "Endocrine System",
    description: "Hormones, diabetes, metabolism, endocrine disorders",
    scenarios: [
      "Diabetic Ketoacidosis",
      "Hypoglycemia Management",
      "Thyroid Crisis",
      "Addisonian Crisis",
      "Hyperglycemic Hyperosmolar State"
    ],
    keyTopics: [
      "Blood glucose monitoring",
      "Insulin administration",
      "Hormone replacement",
      "Metabolic assessment",
      "Emergency management"
    ]
  },
  integumentary: {
    title: "Integumentary System",
    description: "Skin, wounds, burns, dermatological conditions",
    scenarios: [
      "Pressure Ulcer Management",
      "Burn Care",
      "Wound Infection",
      "Skin Cancer Assessment",
      "Dermatitis Management"
    ],
    keyTopics: [
      "Wound assessment",
      "Skin integrity",
      "Infection prevention",
      "Wound care techniques",
      "Dermatological medications"
    ]
  },
  musculoskeletal: {
    title: "Musculoskeletal System",
    description: "Bones, joints, muscles, orthopedic conditions",
    scenarios: [
      "Fracture Management",
      "Joint Replacement Care",
      "Spinal Cord Injury",
      "Osteoporosis Management",
      "Rheumatoid Arthritis"
    ],
    keyTopics: [
      "Mobility assessment",
      "Pain management",
      "Rehabilitation",
      "Orthopedic devices",
      "Physical therapy"
    ]
  },
  neurological: {
    title: "Neurological System",
    description: "Brain, spinal cord, nerves, neurological conditions",
    scenarios: [
      "Stroke Management",
      "Seizure Care",
      "Traumatic Brain Injury",
      "Multiple Sclerosis",
      "Parkinson's Disease"
    ],
    keyTopics: [
      "Neurological assessment",
      "Glasgow Coma Scale",
      "Seizure precautions",
      "Neurological medications",
      "Rehabilitation planning"
    ]
  },
  genitourinary: {
    title: "Genitourinary System",
    description: "Kidneys, urinary system, reproductive health",
    scenarios: [
      "Acute Kidney Injury",
      "Urinary Tract Infection",
      "Dialysis Management",
      "Renal Failure",
      "Reproductive Health Issues"
    ],
    keyTopics: [
      "Renal assessment",
      "Fluid balance",
      "Dialysis care",
      "Urinary catheterization",
      "Reproductive health"
    ]
  },
  psychiatric: {
    title: "Psychiatric/Mental Health",
    description: "Mental health, behavioral conditions, psychiatric care",
    scenarios: [
      "Suicide Risk Assessment",
      "Psychotic Episode",
      "Depression Management",
      "Anxiety Disorders",
      "Substance Abuse"
    ],
    keyTopics: [
      "Mental health assessment",
      "Crisis intervention",
      "Psychiatric medications",
      "Therapeutic communication",
      "Safety planning"
    ]
  }
}

export const DIFFICULTY_LEVELS = {
  beginner: {
    description: "Basic nursing knowledge and skills",
    characteristics: [
      "Recall of basic facts",
      "Simple assessment skills",
      "Basic medication administration",
      "Standard protocols"
    ]
  },
  intermediate: {
    description: "Application of nursing knowledge in clinical situations",
    characteristics: [
      "Clinical reasoning",
      "Priority setting",
      "Complex assessment",
      "Medication calculations"
    ]
  },
  advanced: {
    description: "Complex clinical judgment and critical thinking",
    characteristics: [
      "Critical thinking",
      "Complex problem solving",
      "Advanced assessment",
      "Clinical decision making"
    ]
  }
}

export const QUESTION_TYPES = {
  single: {
    description: "Single best answer multiple choice",
    format: "Choose the best answer from 4-5 options",
    useCase: "Knowledge recall and application"
  },
  multi: {
    description: "Multiple correct answers",
    format: "Select all that apply from 4-5 options", 
    useCase: "Comprehensive understanding"
  },
  order: {
    description: "Prioritization/sequencing",
    format: "Drag and drop to order items by priority",
    useCase: "Clinical reasoning and priority setting"
  }
}

export const PRIORITY_TYPES = {
  assessment: {
    description: "Data collection and analysis",
    examples: [
      "What assessment should be performed first?",
      "Which vital sign is most concerning?",
      "What additional data is needed?"
    ]
  },
  intervention: {
    description: "Nursing actions and treatments",
    examples: [
      "What intervention should be implemented first?",
      "Which medication should be administered?",
      "What nursing action is most appropriate?"
    ]
  },
  evaluation: {
    description: "Outcome evaluation and monitoring",
    examples: [
      "How should the effectiveness be evaluated?",
      "What indicates successful treatment?",
      "Which outcome is most important to monitor?"
    ]
  },
  planning: {
    description: "Care planning and coordination",
    examples: [
      "What should be included in the care plan?",
      "How should care be coordinated?",
      "What resources are needed?"
    ]
  }
}
