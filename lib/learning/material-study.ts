import type { SourceId } from './sources'
export type ClinicalTopic = {
  id: string
  title: string
  minutes: number
  objective: string
  sections: {
    heading: string
    body: string
    example: string
    check: {
      prompt: string
      options: string[]
      correct: number
      rationale: string
    }
  }[]
  sources: SourceId[]
  practiceCollectionId: string
  evolvingCaseIds: string[]
}
export const materialStudyTopics: ClinicalTopic[] = [
  {
    id: 'medications-safety',
    title: 'Medication decisions',
    minutes: 8,
    objective:
      'Connect actual medicine exposure, the patient’s response and a workable monitoring plan.',
    practiceCollectionId: 'medications-safety',
    evolvingCaseIds: ['medication-shift'],
    sources: ['medicationSafety', 'opioidSafety', 'insulinSafety'],
    sections: [
      {
        heading: 'Build an exposure timeline',
        body: 'Reconciliation compares what the person actually uses with the current authorized plan. Include nonprescription products, supplements, allergies and recent changes. Record when relevant medicines were taken and what happened afterwards. A copied list or a signed administration box does not establish that the intended regimen was followed or remains appropriate.',
        example:
          'A patient brings two discharge lists and a sleep aid. Verify the current instructions and actual use with the patient and appropriate records; resolve discrepancies with the team before assuming the lists are interchangeable.',
        check: {
          prompt:
            'Two lists disagree about a medicine that is due. What should happen next?',
          options: [
            'Choose the newest-looking sheet',
            'Clarify the authorized plan and actual exposure before administration',
            'Administer both schedules to avoid an omission',
          ],
          correct: 1,
          rationale:
            'Resolve discrepancies using reliable sources and authorized review; an uncertain record does not establish a safe administration plan.',
        },
      },
      {
        heading: 'Read the response, not one monitor',
        body: 'Assessment continues after administration. Compare alertness, breathing, function and other relevant findings with baseline. Oxygenation and ventilation are different: supplemental oxygen can preserve saturation while breathing becomes inadequate. Increasing sedation after an opioid, particularly with other depressants, requires an immediate clinical response and assessment of competing causes.',
        example:
          'A patient is difficult to wake and breathes shallowly at 8/min while SpO₂ is 98% on oxygen. Stay with the patient, obtain urgent help and assess/support airway and breathing through the local pathway; the saturation does not establish safety.',
        check: {
          prompt:
            'Which finding most challenges reassurance from a normal saturation on oxygen?',
          options: [
            'A lower pain score',
            'The medicine was prescribed',
            'New poor arousal with slow, shallow breathing',
          ],
          correct: 2,
          rationale:
            'Direct evidence of impaired arousal and ventilation outweighs reassurance from an oxygen-supported saturation.',
        },
      },
      {
        heading: 'Coordinate the next dose with the current situation',
        body: 'Nutrition, kidney function, symptoms and treatment goals can change whether a previous plan still fits. Insulin components are not interchangeable: mealtime insulin is related to intake, while basal requirements remain important in type 1 diabetes. An adverse response requires treatment, reassessment and authorized regimen review. Avoid blanket independent cessation or restarting from an obsolete list.',
        example:
          'After recurrent low glucose during delayed meals, the team reviews insulin timing, actual intake, nausea and repeat checks. Teach-back asks the person to explain what to do when the next meal is delayed, rather than simply repeat a drug name.',
        check: {
          prompt:
            'Which plan best prevents recurrence after a meal/insulin mismatch in type 1 diabetes?',
          options: [
            'Review each insulin component, intake and monitoring with the authorized team',
            'Stop every insulin component without review',
            'Resume every prior instruction because one glucose is now normal',
          ],
          correct: 0,
          rationale:
            'An individualized plan addresses the mismatch while preserving essential treatment and monitoring.',
        },
      },
    ],
  },
  {
    id: 'renal-metabolic',
    title: 'Kidney and electrolyte trends',
    minutes: 8,
    objective:
      'Compare renal, volume and electrolyte findings without applying one treatment to every low-output state.',
    practiceCollectionId: 'renal-metabolic',
    evolvingCaseIds: ['kidney-trend'],
    sources: ['aki', 'hyperkalaemia', 'fluids'],
    sections: [
      {
        heading: 'Make the baseline and time interval visible',
        body: 'A recent rise in creatinine or a fall in urine output matters even when an earlier result was normal. Verify the time interval, collection accuracy and drainage. Assess intake, losses, perfusion, congestion, medicines and possible obstruction. One renal result cannot establish the cause, chronicity or permanence of the problem.',
        example:
          'Creatinine changes from 0.9 to 1.6 mg/dL within 36 hours after vomiting, with falling output and pressure. The comparison makes an acute change visible; urgent assessment evaluates several possible contributors rather than naming one cause from the laboratory value alone.',
        check: {
          prompt:
            'What makes a renal result most useful for reasoning about an acute change?',
          options: [
            'Its position on the printed page',
            'The number without any earlier result',
            'The baseline, time interval and associated clinical/output findings',
          ],
          correct: 2,
          rationale:
            'Trajectory and context help distinguish an acute change and guide assessment of possible mechanisms.',
        },
      },
      {
        heading: 'Compare losses with congestion',
        body: 'Low urine output is not an automatic instruction to give fluid. A person with losses and poor perfusion presents a different balance of risks from someone with new crackles, weight gain and breathlessness. Follow an individualized authorized plan, evaluating breathing, pressure, output, laboratory trends and symptoms around each intervention. Improvement in one endpoint does not establish that every mechanism is corrected.',
        example:
          'Two people have rising creatinine. One has vomiting and hypotension; the other has heart failure with respiratory congestion. Both need renal assessment, but the second person’s breathing creates an additional risk from indiscriminate fluid administration.',
        check: {
          prompt:
            'Which new finding most challenges automatic fluid administration for low output?',
          options: [
            'A complete medication chart',
            'Worsening breathlessness and crackles with weight gain',
            'An earlier normal creatinine',
          ],
          correct: 1,
          rationale:
            'Congestion and respiratory compromise require the team to weigh fluid tolerance and perfusion before deciding the plan.',
        },
      },
      {
        heading: 'Evaluate the electrolyte response over time',
        body: 'Interpret an elevated potassium with sample quality, symptoms, renal function, medicines and cardiac assessment. A normal-looking ECG does not exclude clinically important hyperkalaemia. The acute pathway may require concurrent monitoring and treatment by the authorized team. A lower repeat value is encouraging but does not prove complete renal recovery or remove the need to address ongoing contributors and recurrence.',
        example:
          'A repeat non-hemolysed potassium remains elevated while weakness increases. Communicate the verified trend and symptoms promptly, continue monitoring and follow the local pathway rather than waiting for a dramatic ECG change.',
        check: {
          prompt:
            'Which conclusion is justified after potassium improves but creatinine remains above baseline?',
          options: [
            'The electrolyte response is encouraging; renal recovery and recurrence risk still need review',
            'All kidney function is now normal',
            'No follow-up is needed if one ECG is unchanged',
          ],
          correct: 0,
          rationale:
            'Correction of one electrolyte value and recovery of filtration are distinct outcomes that require continued assessment.',
        },
      },
    ],
  },
  {
    id: 'assessment-safety',
    title: 'Assessment that changes the plan',
    minutes: 7,
    objective:
      'Use trends, function and focused reassessment to detect risk that an isolated finding can hide.',
    practiceCollectionId: 'assessment-safety',
    evolvingCaseIds: [],
    sources: [
      'deterioration',
      'traumaAssessment',
      'headInjury',
      'falls',
      'pressureInjury',
    ],
    sections: [
      {
        heading: 'Describe the change before the label',
        body: 'Compare the person with baseline and separate observed findings from an explanation. Include what the patient or family reports, timing, function, pain and relevant measurements. A familiar diagnosis, a reassuring single vital sign or a screening score cannot replace assessment of a new concern. Escalate clinical concern through the local process while verifying uncertain data.',
        example:
          'An older adult is newly unable to stand safely after a fall but reports little pain. The functional change still matters. Record the baseline, mechanism and current assessment rather than concluding there is no injury because pain is mild.',
        check: {
          prompt:
            'Which fact is most useful when evaluating a new mobility concern?',
          options: [
            'It is different from the person’s usual function after the event',
            'The patient is usually independent, so injury is unlikely',
            'The next routine assessment is already scheduled',
          ],
          correct: 0,
          rationale:
            'A new functional change is a meaningful cue requiring assessment in context.',
        },
      },
      {
        heading: 'Use negative findings within their limits',
        body: 'A negative initial test only answers the question that test can reliably address in that setting. After trauma, ongoing deterioration or a concerning mechanism can require further review despite a reassuring first assessment. Head injury assessment also considers medicines such as anticoagulants and changing symptoms. Avoid treating one negative test or a short symptom-free interval as a universal exclusion.',
        example:
          'After an initial assessment, a patient becomes more tachycardic and hypotensive. Communicate the new trend and ask for reassessment; an earlier reassuring result does not make later deterioration irrelevant.',
        check: {
          prompt:
            'What should happen when the clinical trajectory worsens after a reassuring initial test?',
          options: [
            'Remove the new findings from the handover',
            'Reassess and escalate the discrepancy with the earlier result',
            'Assume the test rules out every cause of deterioration',
          ],
          correct: 1,
          rationale:
            'New clinical evidence can change the interpretation and urgency even after an initially reassuring investigation.',
        },
      },
      {
        heading: 'Test whether prevention is working',
        body: 'Falls and skin-injury prevention should fit the person’s actual risks, mobility, skin findings, medicines and preferences. Reassess the response and practical barriers rather than equating a completed checklist with an effective plan. Include the patient and appropriate team members in changes that are safe and feasible. Document what changed and who will follow it up.',
        example:
          'A patient avoids calling for help because the bell is out of reach and toileting is urgent. Move beyond repeating “call first”: assess the environment, assistance and toileting plan, then check whether the revised arrangement is usable.',
        check: {
          prompt:
            'Which outcome best evaluates a tailored falls-prevention plan?',
          options: [
            'Every box was ticked at admission',
            'Every patient received the same leaflet',
            'The person can obtain timely assistance and the identified risks are reassessed',
          ],
          correct: 2,
          rationale:
            'Usability and reassessment connect the prevention plan with the risks it was intended to reduce.',
        },
      },
    ],
  },
  {
    id: 'person-centered-genetics',
    title: 'Genetics and shared decisions',
    minutes: 7,
    objective:
      'Explain what a test can and cannot show while supporting an informed, voluntary and practical care plan.',
    practiceCollectionId: 'person-centered-genetics',
    evolvingCaseIds: [],
    sources: [
      'familyHistory',
      'geneticCounselling',
      'geneticConsent',
      'pharmacogenetics',
      'sharedDecisions',
    ],
    sections: [
      {
        heading: 'Collect a specific family history',
        body: 'Ask which relatives had which conditions and their ages at diagnosis, considering both sides of the family. Distinguish verified information, uncertainty and missing history. A family pattern can support referral and individualized assessment without proving that a person carries a particular variant. Ancestry alone is not a substitute for an actual genotype or a medication-specific clinical evaluation.',
        example:
          'A patient says several relatives had cancer but does not know the type or age. Record what is known, clarify relevant details when possible and discuss appropriate review rather than declaring a hereditary syndrome.',
        check: {
          prompt: 'Which addition makes a family history more informative?',
          options: [
            'The relatives’ favorite foods',
            'The conditions, relationships and approximate ages at diagnosis',
            'A diagnosis assigned solely from ancestry',
          ],
          correct: 1,
          rationale:
            'The pattern of specific conditions, relationships and timing can inform assessment while preserving uncertainty.',
        },
      },
      {
        heading: 'Match the result to the test’s purpose',
        body: 'Screening, diagnostic, tumor and germline tests answer different questions. A variant of uncertain significance is not a confirmed disease-causing result. A negative result may not remove risk, particularly when the reason for concern remains unexplained. Explain the scope and limits with qualified support. Medication-related genetic associations are specific; genetic information is one factor among several in prescribing and monitoring.',
        example:
          'A tumor test identifies a variant. It may be acquired or inherited. Appropriate review determines whether germline testing is relevant; the tumor finding alone does not establish a relative’s inherited status.',
        check: {
          prompt:
            'What is the strongest interpretation of a variant of uncertain significance?',
          options: [
            'It proves that relatives carry a disease-causing variant',
            'It establishes that all usual screening should stop',
            'Its clinical meaning is uncertain and needs appropriate interpretation',
          ],
          correct: 2,
          rationale:
            'An uncertain finding should not be turned into a definitive inherited-risk or treatment conclusion.',
        },
      },
      {
        heading: 'Check the decision and the pathway',
        body: 'Informed consent includes purpose, potential benefits, limitations, implications, disclosure and the opportunity to ask questions. Support a voluntary choice to accept, postpone or decline testing through the appropriate clinical process. Use teach-back to evaluate the explanation. A missed counseling appointment may reveal an access barrier rather than a decision to refuse; practical arrangements matter alongside information.',
        example:
          'A patient misses counseling because travel means lost wages and remains interested in testing. Explore preferences and feasible access options instead of labeling the patient uncooperative or ordering a test without the needed discussion.',
        check: {
          prompt:
            'Which response best supports an informed, feasible genetics plan?',
          options: [
            'Explore the person’s questions, preferences and access barriers with the appropriate team',
            'Order testing to avoid another counseling appointment',
            'Treat every missed visit as an informed refusal',
          ],
          correct: 0,
          rationale:
            'A voluntary and usable pathway addresses both understanding and the circumstances that affect access.',
        },
      },
    ],
  },
]
