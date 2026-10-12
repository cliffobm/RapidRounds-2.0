import { Scenario, User } from '@/types'

export const sampleScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Cardiac Assessment - Chest Pain',
    description: 'A 65-year-old patient presents with acute chest pain. Assess the situation and determine the appropriate nursing interventions.',
    content: {
      patient_info: {
        name: 'John Smith',
        age: 65,
        gender: 'male',
        weight: 180,
        height: 70,
        allergies: ['Penicillin'],
        medications: ['Metoprolol 50mg daily', 'Aspirin 81mg daily'],
        medical_history: ['Hypertension', 'Type 2 Diabetes', 'Previous MI (2019)']
      },
      vital_signs: {
        temperature: 98.6,
        blood_pressure: { systolic: 160, diastolic: 95 },
        heart_rate: 110,
        respiratory_rate: 24,
        oxygen_saturation: 94,
        pain_level: 8
      },
      history: 'Patient reports sudden onset of crushing chest pain that started 30 minutes ago while watching TV. Pain radiates to left arm and jaw. Associated with diaphoresis and nausea.',
      presentation: 'Patient appears anxious and diaphoretic. Holding chest with left hand. Speaking in short sentences due to pain.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the priority nursing assessment for this patient?',
          options: [
            'Check blood glucose level',
            'Assess pain using 0-10 scale',
            'Obtain 12-lead ECG',
            'Check blood pressure in both arms'
          ],
          correct_answer: 'Obtain 12-lead ECG',
          points: 10,
          explanation: 'A 12-lead ECG is the priority assessment to rule out acute myocardial infarction, which is the most life-threatening cause of chest pain.',
          category: 'assessment'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Which medication should be administered first?',
          options: [
            'Metoprolol',
            'Aspirin',
            'Morphine',
            'Nitroglycerin'
          ],
          correct_answer: 'Aspirin',
          points: 10,
          explanation: 'Aspirin should be administered first as it helps prevent further clot formation and reduces mortality in acute coronary syndrome.',
          category: 'intervention'
        },
        {
          id: 'q3',
          type: 'priority',
          question: 'Prioritize these nursing interventions:',
          options: [
            'Administer oxygen',
            'Obtain IV access',
            'Monitor vital signs',
            'Prepare for cardiac catheterization'
          ],
          correct_answer: ['Administer oxygen', 'Obtain IV access', 'Monitor vital signs', 'Prepare for cardiac catheterization'],
          points: 15,
          explanation: 'Oxygen first to improve oxygenation, then IV access for medications, continuous monitoring, and preparation for definitive treatment.',
          category: 'planning'
        }
      ],
      rationales: [
        {
          question_id: 'q1',
          explanation: 'ECG is essential for diagnosing acute MI and determining treatment approach.',
          evidence: ['American Heart Association Guidelines', 'Evidence-based practice protocols'],
          references: ['AHA 2020 Guidelines', 'Nursing Best Practices'],
          tier: 'free'
        }
      ],
      resources: [
        {
          id: 'r1',
          type: 'video',
          title: 'ECG Interpretation Basics',
          url: '/videos/ecg-basics',
          description: 'Learn the fundamentals of ECG interpretation'
        }
      ]
    },
    difficulty: 'intermediate',
    category: 'Cardiac',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 15,
    learning_objectives: [
      'Recognize signs and symptoms of acute coronary syndrome',
      'Prioritize nursing interventions for chest pain',
      'Understand medication administration for cardiac emergencies'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Respiratory Assessment - Shortness of Breath',
    description: 'A 45-year-old patient with COPD presents with increased shortness of breath. Assess and manage the respiratory distress.',
    content: {
      patient_info: {
        name: 'Maria Rodriguez',
        age: 45,
        gender: 'female',
        weight: 140,
        height: 65,
        allergies: ['Latex'],
        medications: ['Albuterol inhaler', 'Prednisone 20mg daily'],
        medical_history: ['COPD', 'Smoking history (30 pack-years)']
      },
      vital_signs: {
        temperature: 99.2,
        blood_pressure: { systolic: 140, diastolic: 88 },
        heart_rate: 95,
        respiratory_rate: 28,
        oxygen_saturation: 88,
        pain_level: 3
      },
      history: 'Patient reports increased shortness of breath over the past 2 days. Unable to complete sentences. Using accessory muscles to breathe.',
      presentation: 'Patient sitting upright, leaning forward. Using pursed-lip breathing. Appears anxious and fatigued.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the most appropriate initial intervention?',
          options: [
            'Administer oxygen at 2L/min',
            'Administer oxygen at 6L/min',
            'Position patient supine',
            'Administer bronchodilator'
          ],
          correct_answer: 'Administer oxygen at 2L/min',
          points: 10,
          explanation: 'COPD patients should receive low-flow oxygen to avoid suppressing their hypoxic drive to breathe.',
          category: 'intervention'
        }
      ],
      rationales: [],
      resources: []
    },
    difficulty: 'beginner',
    category: 'Respiratory',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 12,
    learning_objectives: [
      'Assess respiratory distress in COPD patients',
      'Apply oxygen therapy principles for COPD',
      'Recognize signs of respiratory failure'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    title: 'Medication Administration - Insulin Management',
    description: 'A diabetic patient requires insulin administration. Calculate the correct dose and administer safely.',
    content: {
      patient_info: {
        name: 'Robert Johnson',
        age: 58,
        gender: 'male',
        weight: 200,
        height: 72,
        allergies: ['None known'],
        medications: ['Metformin 1000mg BID', 'Lisinopril 10mg daily'],
        medical_history: ['Type 2 Diabetes', 'Hypertension']
      },
      vital_signs: {
        temperature: 98.4,
        blood_pressure: { systolic: 130, diastolic: 80 },
        heart_rate: 78,
        respiratory_rate: 16,
        oxygen_saturation: 98,
        pain_level: 0
      },
      history: 'Patient admitted for elective surgery. Blood glucose is 180 mg/dL. Surgeon requests insulin coverage.',
      presentation: 'Patient is alert and oriented. No acute distress. Ready for surgery.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the correct insulin dose for a blood glucose of 180 mg/dL?',
          options: [
            '2 units',
            '4 units',
            '6 units',
            '8 units'
          ],
          correct_answer: '4 units',
          points: 15,
          explanation: 'Using the sliding scale: (180-150)/10 = 3, rounded to 4 units for safety.',
          category: 'intervention'
        }
      ],
      rationales: [],
      resources: []
    },
    difficulty: 'advanced',
    category: 'Pharmacology',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 20,
    learning_objectives: [
      'Calculate insulin doses using sliding scale',
      'Understand medication safety principles',
      'Apply diabetes management protocols'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    title: 'Neurological Assessment - Stroke Protocol',
    description: 'A 68-year-old patient presents with sudden onset of left-sided weakness and speech difficulties. Implement stroke protocol and assess neurological status.',
    content: {
      patient_info: {
        name: 'Margaret Thompson',
        age: 68,
        gender: 'female',
        weight: 155,
        height: 64,
        allergies: ['Aspirin'],
        medications: ['Lisinopril 10mg daily', 'Atorvastatin 40mg daily'],
        medical_history: ['Hypertension', 'Atrial Fibrillation', 'Previous TIA (2022)']
      },
      vital_signs: {
        temperature: 98.8,
        blood_pressure: { systolic: 185, diastolic: 105 },
        heart_rate: 95,
        respiratory_rate: 18,
        oxygen_saturation: 96,
        pain_level: 2
      },
      history: 'Patient was found by her daughter at 2 PM with sudden onset of left-sided weakness and slurred speech. Last known normal was 1:30 PM. Patient is alert but confused about time and place.',
      presentation: 'Patient is alert but oriented only to person. Left facial droop present. Left arm and leg show 2/5 strength. Speech is slurred and difficult to understand.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the priority nursing action for this patient?',
          options: [
            'Obtain detailed history from family',
            'Perform NIH Stroke Scale assessment',
            'Check blood glucose level',
            'Obtain baseline vital signs'
          ],
          correct_answer: 'Perform NIH Stroke Scale assessment',
          points: 15,
          explanation: 'The NIH Stroke Scale is the gold standard for assessing stroke severity and determining treatment eligibility. Time is critical in stroke care.',
          category: 'assessment'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'What is the time window for thrombolytic therapy?',
          options: [
            '2 hours from symptom onset',
            '3 hours from symptom onset',
            '4.5 hours from symptom onset',
            '6 hours from symptom onset'
          ],
          correct_answer: '4.5 hours from symptom onset',
          points: 10,
          explanation: 'The current guidelines allow thrombolytic therapy up to 4.5 hours from symptom onset, with earlier treatment being more effective.',
          category: 'intervention'
        },
        {
          id: 'q3',
          type: 'priority',
          question: 'Prioritize these interventions for acute stroke:',
          options: [
            'Obtain CT scan without contrast',
            'Establish IV access',
            'Monitor neurological status',
            'Prepare for thrombolytic therapy'
          ],
          correct_answer: ['Obtain CT scan without contrast', 'Establish IV access', 'Monitor neurological status', 'Prepare for thrombolytic therapy'],
          points: 20,
          explanation: 'CT scan rules out hemorrhage, IV access is needed for potential thrombolytics, continuous monitoring is essential, and preparation saves time if therapy is indicated.',
          category: 'planning'
        }
      ],
      rationales: [
        {
          question_id: 'q1',
          explanation: 'NIH Stroke Scale provides standardized assessment of stroke severity and helps determine treatment eligibility.',
          evidence: ['American Heart Association Guidelines', 'NIH Stroke Scale Protocol'],
          references: ['AHA 2021 Guidelines', 'NIH Stroke Scale Manual'],
          tier: 'free'
        }
      ],
      resources: [
        {
          id: 'r1',
          type: 'video',
          title: 'NIH Stroke Scale Training',
          url: '/videos/nih-stroke-scale',
          description: 'Learn how to perform the NIH Stroke Scale assessment'
        }
      ]
    },
    difficulty: 'advanced',
    category: 'Neurological',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 25,
    learning_objectives: [
      'Recognize signs and symptoms of acute stroke',
      'Perform NIH Stroke Scale assessment',
      'Understand thrombolytic therapy time windows',
      'Prioritize interventions for stroke patients'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    title: 'Pediatric Assessment - Fever and Dehydration',
    description: 'A 3-year-old child presents with high fever, decreased oral intake, and signs of dehydration. Assess and manage pediatric dehydration.',
    content: {
      patient_info: {
        name: 'Emma Rodriguez',
        age: 3,
        gender: 'female',
        weight: 15,
        height: 36,
        allergies: ['None known'],
        medications: ['None'],
        medical_history: ['Normal development', 'No significant medical history']
      },
      vital_signs: {
        temperature: 39.5,
        blood_pressure: { systolic: 95, diastolic: 60 },
        heart_rate: 140,
        respiratory_rate: 28,
        oxygen_saturation: 98,
        pain_level: 6
      },
      history: 'Mother reports child has been febrile for 2 days with decreased appetite and activity. Child has had only 2 wet diapers in the past 24 hours. No vomiting or diarrhea.',
      presentation: 'Child appears lethargic and irritable. Skin turgor is poor. Mucous membranes are dry. Capillary refill is 3 seconds. Child is crying but no tears.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the most appropriate initial assessment for this child?',
          options: [
            'Obtain detailed history from mother',
            'Perform pediatric dehydration assessment',
            'Check blood pressure in all extremities',
            'Obtain urine specimen'
          ],
          correct_answer: 'Perform pediatric dehydration assessment',
          points: 12,
          explanation: 'Pediatric dehydration assessment includes skin turgor, mucous membranes, capillary refill, and fontanelle assessment to determine severity.',
          category: 'assessment'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'What is the priority intervention for this child?',
          options: [
            'Administer antipyretic medication',
            'Start IV fluid resuscitation',
            'Obtain blood cultures',
            'Encourage oral fluids'
          ],
          correct_answer: 'Start IV fluid resuscitation',
          points: 15,
          explanation: 'This child shows signs of moderate to severe dehydration and requires immediate IV fluid resuscitation to prevent shock.',
          category: 'intervention'
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'What fluid rate should be used for initial resuscitation?',
          options: [
            '10ml/kg over 1 hour',
            '20ml/kg over 1 hour',
            '10ml/kg over 30 minutes',
            '20ml/kg over 30 minutes'
          ],
          correct_answer: '20ml/kg over 1 hour',
          points: 10,
          explanation: 'For moderate dehydration, 20ml/kg of isotonic fluid over 1 hour is the standard initial bolus rate.',
          category: 'intervention'
        }
      ],
      rationales: [
        {
          question_id: 'q1',
          explanation: 'Pediatric dehydration assessment is critical for determining treatment approach and fluid requirements.',
          evidence: ['Pediatric Advanced Life Support Guidelines', 'WHO Dehydration Assessment'],
          references: ['PALS 2020 Guidelines', 'WHO Dehydration Protocol'],
          tier: 'free'
        }
      ],
      resources: [
        {
          id: 'r1',
          type: 'video',
          title: 'Pediatric Dehydration Assessment',
          url: '/videos/pediatric-dehydration',
          description: 'Learn how to assess dehydration in pediatric patients'
        }
      ]
    },
    difficulty: 'intermediate',
    category: 'Pediatric',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 18,
    learning_objectives: [
      'Assess pediatric dehydration severity',
      'Calculate fluid resuscitation requirements',
      'Recognize signs of pediatric shock',
      'Understand pediatric vital sign norms'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '6',
    title: 'Gastrointestinal Assessment - Appendicitis',
    description: 'A 16-year-old male presents with abdominal pain and nausea. Assess for appendicitis and manage the surgical emergency.',
    content: {
      patient_info: {
        name: 'Jake Thompson',
        age: 16,
        gender: 'male',
        weight: 65,
        height: 175,
        allergies: ['None known'],
        medications: ['None'],
        medical_history: ['No significant medical history']
      },
      vital_signs: {
        temperature: 38.5,
        blood_pressure: { systolic: 120, diastolic: 75 },
        heart_rate: 105,
        respiratory_rate: 22,
        oxygen_saturation: 98,
        pain_level: 7
      },
      history: 'Patient reports abdominal pain starting around umbilicus 6 hours ago, now localized to right lower quadrant. Associated with nausea and vomiting. Pain is sharp and constant.',
      presentation: 'Patient lying still in bed, guarding abdomen, appears uncomfortable. Right lower quadrant is tender to palpation. Positive McBurney\'s point tenderness.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the most important assessment finding for appendicitis?',
          options: [
            'Rebound tenderness',
            'Bowel sounds',
            'Abdominal distension',
            'Nausea and vomiting'
          ],
          correct_answer: 'Rebound tenderness',
          points: 10,
          explanation: 'Rebound tenderness is a key sign of peritonitis and appendicitis, indicating peritoneal inflammation.',
          category: 'assessment'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'What is the priority nursing intervention?',
          options: [
            'Administer pain medication',
            'Prepare for surgery',
            'Start IV fluids',
            'Obtain blood work'
          ],
          correct_answer: 'Prepare for surgery',
          points: 12,
          explanation: 'Appendicitis is a surgical emergency. The priority is to prepare the patient for appendectomy to prevent rupture.',
          category: 'intervention'
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'What should be avoided in this patient?',
          options: [
            'IV fluids',
            'Pain medication',
            'Food and water',
            'Vital signs monitoring'
          ],
          correct_answer: 'Food and water',
          points: 8,
          explanation: 'NPO status is maintained for surgical patients to prevent aspiration during anesthesia.',
          category: 'intervention'
        }
      ],
      rationales: [
        {
          question_id: 'q1',
          explanation: 'Rebound tenderness indicates peritoneal inflammation and is a classic sign of appendicitis.',
          evidence: ['Surgical Assessment Guidelines', 'Emergency Medicine Protocols'],
          references: ['Emergency Surgery Guidelines', 'Nursing Assessment Manual'],
          tier: 'free'
        }
      ],
      resources: [
        {
          id: 'r1',
          type: 'video',
          title: 'Appendicitis Assessment',
          url: '/videos/appendicitis-assessment',
          description: 'Learn how to assess for appendicitis in pediatric and adult patients'
        }
      ]
    },
    difficulty: 'beginner',
    category: 'Gastrointestinal',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 15,
    learning_objectives: [
      'Recognize signs and symptoms of appendicitis',
      'Perform abdominal assessment techniques',
      'Understand surgical preparation protocols',
      'Apply pain management principles'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '7',
    title: 'Endocrine Assessment - Diabetic Ketoacidosis',
    description: 'A 19-year-old female presents with nausea, vomiting, and altered mental status. Manage her diabetic ketoacidosis.',
    content: {
      patient_info: {
        name: 'Sarah Chen',
        age: 19,
        gender: 'female',
        weight: 50,
        height: 165,
        allergies: ['None known'],
        medications: ['Insulin glargine 20 units daily'],
        medical_history: ['Type 1 Diabetes diagnosed at age 12']
      },
      vital_signs: {
        temperature: 37.8,
        blood_pressure: { systolic: 100, diastolic: 60 },
        heart_rate: 130,
        respiratory_rate: 30,
        oxygen_saturation: 95,
        pain_level: 4
      },
      history: 'Patient reports 3 days of nausea, vomiting, increased thirst and urination. Now confused and lethargic. Blood glucose at home was "high" on meter.',
      presentation: 'Patient lethargic, Kussmaul respirations present, fruity breath odor, dry mucous membranes, poor skin turgor.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the priority intervention for DKA?',
          options: [
            'Insulin therapy',
            'Fluid replacement',
            'Electrolyte replacement',
            'Glucose monitoring'
          ],
          correct_answer: 'Fluid replacement',
          points: 15,
          explanation: 'Fluid replacement is the first priority in DKA to correct dehydration and improve tissue perfusion.',
          category: 'intervention'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'What type of fluid should be used initially?',
          options: [
            'D5W',
            'Normal saline',
            'Lactated Ringer\'s',
            'Half normal saline'
          ],
          correct_answer: 'Normal saline',
          points: 10,
          explanation: 'Normal saline is used initially to correct dehydration and improve circulation before starting insulin therapy.',
          category: 'intervention'
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'What is the most important monitoring parameter?',
          options: [
            'Blood glucose',
            'Serum potassium',
            'Arterial blood gas',
            'Urine output'
          ],
          correct_answer: 'Serum potassium',
          points: 12,
          explanation: 'Potassium levels must be monitored closely as they can drop rapidly with insulin therapy, causing cardiac arrhythmias.',
          category: 'assessment'
        }
      ],
      rationales: [
        {
          question_id: 'q1',
          explanation: 'Fluid replacement is critical in DKA to restore circulating volume and improve tissue perfusion.',
          evidence: ['American Diabetes Association Guidelines', 'Critical Care Protocols'],
          references: ['ADA 2023 Guidelines', 'Emergency Medicine Standards'],
          tier: 'free'
        }
      ],
      resources: [
        {
          id: 'r1',
          type: 'video',
          title: 'DKA Management',
          url: '/videos/dka-management',
          description: 'Learn how to manage diabetic ketoacidosis in emergency settings'
        }
      ]
    },
    difficulty: 'advanced',
    category: 'Endocrine',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 30,
    learning_objectives: [
      'Recognize signs and symptoms of DKA',
      'Manage fluid and electrolyte balance',
      'Understand insulin therapy protocols',
      'Apply critical care monitoring principles'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '8',
    title: 'Integumentary Assessment - Pressure Ulcer Management',
    description: 'A 78-year-old bedbound patient has developed a stage 3 pressure ulcer. Manage wound care and prevent further complications.',
    content: {
      patient_info: {
        name: 'Robert Taylor',
        age: 78,
        gender: 'male',
        weight: 70,
        height: 175,
        allergies: ['None known'],
        medications: ['Warfarin 5mg daily', 'Metoprolol 25mg BID'],
        medical_history: ['Stroke with left hemiparesis', 'Atrial fibrillation', 'Immobility for 3 months']
      },
      vital_signs: {
        temperature: 37.5,
        blood_pressure: { systolic: 140, diastolic: 85 },
        heart_rate: 95,
        respiratory_rate: 18,
        oxygen_saturation: 96,
        pain_level: 5
      },
      history: 'Patient has been bedbound for 3 months post-stroke. Pressure ulcer on sacrum developed 1 week ago. Wound is getting larger and more painful.',
      presentation: 'Patient lying in bed, stage 3 pressure ulcer on sacrum measuring 4cm x 3cm with surrounding erythema. Wound bed shows yellow slough with some red granulation tissue.',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the most important prevention strategy for pressure ulcers?',
          options: [
            'Wound care',
            'Pressure relief',
            'Nutrition',
            'Hygiene'
          ],
          correct_answer: 'Pressure relief',
          points: 10,
          explanation: 'Regular repositioning and pressure relief are the most effective ways to prevent pressure ulcers.',
          category: 'assessment'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'How often should this patient be repositioned?',
          options: [
            'Every 2 hours',
            'Every 4 hours',
            'Every 6 hours',
            'Every 8 hours'
          ],
          correct_answer: 'Every 2 hours',
          points: 8,
          explanation: 'High-risk patients should be repositioned every 2 hours to prevent pressure ulcer development.',
          category: 'intervention'
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'What is the priority wound care intervention?',
          options: [
            'Apply antibiotic ointment',
            'Debride necrotic tissue',
            'Cover with dry dressing',
            'Apply pressure dressing'
          ],
          correct_answer: 'Debride necrotic tissue',
          points: 12,
          explanation: 'Debridement of necrotic tissue is essential to promote healing and prevent infection.',
          category: 'intervention'
        }
      ],
      rationales: [
        {
          question_id: 'q1',
          explanation: 'Pressure relief through repositioning is the cornerstone of pressure ulcer prevention.',
          evidence: ['Wound Care Guidelines', 'Pressure Ulcer Prevention Protocols'],
          references: ['NPUAP Guidelines', 'Nursing Best Practices'],
          tier: 'free'
        }
      ],
      resources: [
        {
          id: 'r1',
          type: 'video',
          title: 'Pressure Ulcer Staging and Care',
          url: '/videos/pressure-ulcer-care',
          description: 'Learn how to stage and manage pressure ulcers'
        }
      ]
    },
    difficulty: 'intermediate',
    category: 'Integumentary',
    is_custom: false,
    author_id: null,
    institution_id: null,
    is_published: true,
    estimated_duration: 20,
    learning_objectives: [
      'Assess pressure ulcer staging',
      'Implement wound care protocols',
      'Understand pressure relief strategies',
      'Apply infection prevention principles'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export const sampleUsers: User[] = [
  {
    id: '1',
    email: 'educator@rapidrounds.com',
    full_name: 'Dr. Sarah Wilson',
    avatar_url: null,
    role: 'educator',
    institution_id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'student@rapidrounds.com',
    full_name: 'Alex Johnson',
    avatar_url: null,
    role: 'student',
    institution_id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]
