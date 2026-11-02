import type { ChoiceDraftV2, QuestionDraftV2 } from '@/lib/cjis/question-v2'
import type { PillarId } from '@/lib/learning/pillars'
import type { SourceId } from '@/lib/learning/sources'

const references: SourceId[][] = [
  ['geneticCounselling'],
  ['familyHistory'],
  ['geneticCounselling'],
  ['geneticConsent'],
  ['pharmacogenetics'],
  ['geneticCounselling', 'familyHistory'],
  ['geneticConsent', 'sharedDecisions'],
  ['geneticCounselling', 'familyHistory'],
  ['geneticCounselling'],
  ['pharmacogenetics', 'medicationSafety'],
  ['geneticCounselling', 'familyHistory'],
  ['geneticCounselling', 'sharedDecisions'],
  ['geneticConsent', 'geneticCounselling'],
  ['pharmacogenetics', 'medicationSafety'],
  ['geneticCounselling'],
]

// Individually assigned to the decision being assessed, independently of level.
const skills: PillarId[] = [
  'analyze_cues',
  'recognize_cues',
  'analyze_cues',
  'take_action',
  'analyze_cues',
  'generate_solutions',
  'take_action',
  'generate_solutions',
  'prioritize_hypotheses',
  'analyze_cues',
  'prioritize_hypotheses',
  'generate_solutions',
  'generate_solutions',
  'analyze_cues',
  'analyze_cues',
]

const right = (
  text: string,
  explanation: string,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, cues })
const wrong = (
  text: string,
  explanation: string,
  plausible: string,
  error: NonNullable<ChoiceDraftV2['error']>,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, plausible, error, cues })
function item(
  draft: Omit<
    QuestionDraftV2,
    'collectionId' | 'domain' | 'setting' | 'sources' | 'correct'
  >,
  position: number
): QuestionDraftV2 {
  // Rotation changes presentation only; every item below has its own clinical decision and rationale.
  const offset = position % 4
  const options = [
    ...draft.options.slice(offset),
    ...draft.options.slice(0, offset),
  ] as QuestionDraftV2['options']
  draft = { ...draft, primaryCompetency: skills[position]! }
  return {
    ...draft,
    options,
    correct: ((4 - offset) % 4) as QuestionDraftV2['correct'],
    collectionId: 'person-centered-genetics',
    domain: 'person_centered',
    setting: 'Adult outpatient nursing and genetics follow-up',
    sources: references[position]!,
  }
}

export const geneticsQualityQuestions: QuestionDraftV2[] = [
  item(
    {
      id: 'v2-genetics-f-uncertain',
      topic: 'Explaining an uncertain genetic result',
      level: 'foundation',
      scenario:
        'An adult receives a hereditary cancer panel report. The report lists a variant of uncertain significance. The patient asks whether this means the variant causes cancer. The nurse is preparing the initial explanation before the genetics appointment.',
      cues: [
        'The laboratory classified the finding as a variant of uncertain significance.',
        'The patient equates the result with a disease-causing variant.',
      ],
      question:
        'How should the nurse explain the variant of uncertain significance?',
      options: [
        right(
          'The evidence does not yet establish whether this variant changes cancer risk.',
          'An uncertain classification means the available evidence cannot establish the variant as harmful or benign. It does not independently establish a hereditary cancer diagnosis or replace assessment of the person and family history.',
          [0, 1]
        ),
        wrong(
          'The panel found an inherited cause that explains the patient’s cancer risk.',
          'This converts an uncertain finding into a pathogenic result. Detecting a sequence change is different from establishing that the change causes disease.',
          'A learner may equate any reported genetic finding with a positive pathogenic result.',
          'cue_misinterpretation',
          [0]
        ),
        wrong(
          'The panel excludes inherited risk because the variant was not called pathogenic.',
          'An uncertain finding is not a definitive negative result. Other genetic or familial risk may remain, depending on test coverage and history.',
          'The absence of a pathogenic label can be mistaken for a complete exclusion of inherited risk.',
          'premature_closure',
          [0]
        ),
        wrong(
          'The result establishes carrier status without implications for the patient’s own health.',
          'Carrier status has a specific relationship to the gene and inheritance pattern. An uncertain classification alone does not support that interpretation.',
          'Carrier language may sound like an appropriately cautious alternative to a diagnosis.',
          'cue_misinterpretation',
          [0]
        ),
      ],
      reasoning: [
        'Distinguish detection of a variant from evidence that it causes disease.',
      ],
      debrief:
        'Interpret the laboratory classification before assigning clinical meaning. An uncertain result calls for accurate explanation and planned review, rather than certainty in either direction.',
    },
    0
  ),
  item(
    {
      id: 'v2-genetics-f-history',
      topic: 'Decision-relevant family history',
      level: 'foundation',
      scenario:
        'A patient says several relatives have had cancer. The intake form contains names but no cancer diagnoses. The ages at diagnosis have not been recorded. The nurse has time for one focused clarification before the consultation.',
      cues: [
        'Several relatives reportedly had cancer without a documented diagnosis.',
        'Ages at diagnosis are missing.',
      ],
      question:
        'Which clarification provides the most useful information for hereditary-risk assessment?',
      options: [
        right(
          'Record each affected relative’s biological relationship, cancer diagnosis and age at diagnosis.',
          'Relationship, cancer type and age at diagnosis help identify patterns that may warrant more detailed genetic assessment. A list of names or a broad count does not provide those distinctions.',
          [0, 1]
        ),
        wrong(
          'Record the total number of relatives affected and their current ages together.',
          'A family count is incomplete without the relationship and diagnosis, and current age cannot substitute for age at diagnosis.',
          'A numerical summary seems efficient when several relatives are involved.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Record the relatives’ treatments and whether each person tolerated chemotherapy well.',
          'Treatment history can later clarify a diagnosis, but treatment tolerance is less useful than the missing relationship, diagnosis and age information for this initial risk assessment.',
          'Treatment details feel medically specific and may seem more informative than a pedigree.',
          'misprioritization',
          [0]
        ),
        wrong(
          'Record the relatives’ shared diet and smoking history before expanding the pedigree.',
          'Shared exposures can matter, but they do not replace the missing basic family-history elements needed to assess an inherited pattern.',
          'Common environmental exposures offer a plausible competing explanation for familial disease.',
          'misprioritization',
          [0, 1]
        ),
      ],
      reasoning: [
        'Identify the missing history elements that determine an inherited pattern.',
      ],
      debrief:
        'A useful family history connects the diagnosis to a biological relationship and timing. Collect those basic elements before drawing conclusions about inheritance.',
    },
    1
  ),
  item(
    {
      id: 'v2-genetics-f-tumor',
      topic: 'Tumor testing and inherited risk',
      level: 'foundation',
      scenario:
        'A patient brings a report from sequencing of a removed tumor. The report identifies a change that may guide cancer treatment. No blood or saliva testing for inherited variants has been performed. The patient asks whether the tumor result proves that a sibling has the same change.',
      cues: [
        'The sample was tumor tissue used to guide treatment.',
        'No inherited-variant test has been performed.',
        'The patient wants to infer a sibling’s result.',
      ],
      question: 'Which response best distinguishes the two types of testing?',
      options: [
        right(
          'Explain that a tumor finding may need separate inherited-risk evaluation before family conclusions.',
          'Tumor changes may be acquired in the tumor or may reflect an inherited finding. The tumor report alone does not establish a sibling’s genotype; the treating and genetics teams determine whether germline evaluation is appropriate.',
          [0, 1, 2]
        ),
        wrong(
          'Explain that a treatment-relevant tumor change establishes a shared inherited family variant.',
          'A treatment target in tumor tissue is not automatically an inherited variant. Family conclusions require the appropriate inherited-risk assessment.',
          'A clinically actionable tumor result can sound sufficiently definitive to apply to relatives.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Explain that tumor findings concern acquired changes and exclude inherited family implications.',
          'Some tumor findings prompt germline assessment. Excluding inherited implications solely because the original sample was tumor tissue closes that evaluation too early.',
          'Distinguishing somatic from germline testing may be overextended into a categorical exclusion.',
          'premature_closure',
          [0]
        ),
        wrong(
          'Explain that the sibling should use the tumor result to select a surveillance schedule.',
          'A sibling’s surveillance depends on that person’s risk assessment and any appropriately established familial variant. Acting directly on another person’s tumor report skips this distinction.',
          'Earlier surveillance seems protective when a relative already has cancer.',
          'misprioritization',
          [0, 2]
        ),
      ],
      reasoning: [
        'Distinguish a tumor-specific treatment finding from an established inherited variant.',
      ],
      debrief:
        'Identify what sample was tested and what the test was designed to answer. A report that guides one patient’s treatment may raise a family question without answering it.',
    },
    2
  ),
  item(
    {
      id: 'v2-genetics-f-consent',
      topic: 'Voluntary genetic testing',
      level: 'foundation',
      scenario:
        'A competent adult attends a genetic-testing appointment. The patient says a relative booked the test and expects it to be completed today. The patient says they do not understand what the result could mean. A sample kit is ready on the desk.',
      cues: [
        'The patient does not understand the potential meaning of the test.',
        'A relative expects the test to proceed today.',
      ],
      question:
        'What is the nurse’s best next step before collecting the sample?',
      options: [
        right(
          'Pause collection and arrange an explanation of benefits, limits and the patient’s testing preferences.',
          'Voluntary informed consent requires the patient’s understanding and choice. A ready kit and family expectation do not replace discussion of benefits, limitations, consequences and whether the person wants testing.',
          [0, 1]
        ),
        wrong(
          'Collect the sample and schedule a detailed explanation when the result becomes available.',
          'Explaining a result later cannot substitute for informed choice before testing. Collection should follow an adequate consent process.',
          'A learner may regard sample collection as reversible and focus consent on later interpretation.',
          'misprioritization',
          [0]
        ),
        wrong(
          'Ask the relative to explain the expected benefit and confirm the patient’s testing plan.',
          'Family input may be helpful with permission, but the competent adult’s understanding and preferences must direct consent. A relative cannot supply these on the patient’s behalf.',
          'The relative appears informed and has already coordinated the appointment.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Use the signed appointment form to confirm consent and proceed with specimen collection.',
          'An administrative form does not resolve the patient’s stated lack of understanding. Consent is a process, rather than an inference from attendance or paperwork.',
          'A signed document may be treated as sufficient evidence of informed agreement.',
          'premature_closure',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize that stated lack of understanding requires a consent discussion before testing.',
      ],
      debrief:
        'Treat the patient’s expressed uncertainty as a consent issue. Support a voluntary decision before completing the technical steps of testing.',
    },
    3
  ),
  item(
    {
      id: 'v2-genetics-f-drug',
      topic: 'Interpreting a pharmacogenetic association',
      level: 'foundation',
      scenario:
        'A patient reads that a gene is associated with the response to a prescribed medicine. The patient has not had a clinical pharmacogenetic test. They ask whether the association means they should halve their dose tonight. The nurse is responding to this question during medication teaching.',
      cues: [
        'A published gene–drug association is not an individual clinical test result.',
        'The patient proposes changing the prescribed dose.',
      ],
      question: 'Which guidance best addresses the patient’s interpretation?',
      options: [
        right(
          'Continue the prescribed plan while the prescriber or pharmacist reviews whether testing affects this medicine.',
          'An association does not establish this patient’s genotype, a need for routine testing or an individual dose change. Medication decisions require the relevant evidence, labeling and clinical context with the prescribing team.',
          [0, 1]
        ),
        wrong(
          'Reduce the dose temporarily because a gene association predicts reduced metabolism in most patients.',
          'The association does not identify this person’s metabolism or support a temporary dose reduction. An unnecessary reduction can compromise treatment.',
          'Reducing exposure may seem a cautious response to uncertainty about metabolism.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Request a broad commercial panel and use its dose suggestions before the next prescription review.',
          'Test scope, clinical validity and the relevant medication must be considered before using a report to guide therapy. A broad panel is not a substitute for a supervised medication review.',
          'Obtaining more genetic information seems like the fastest route to an individualized dose.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'Reassure the patient that a tolerated medicine is unaffected by inherited differences in metabolism.',
          'Prior tolerance does not establish the absence of a pharmacogenetic effect. The appropriate response is review, without unsupported reassurance or an independent dose change.',
          'Current tolerance is an understandable but incomplete basis for dismissing future risk.',
          'premature_closure',
          [0]
        ),
      ],
      reasoning: [
        'Distinguish a population association from an individual medication instruction.',
      ],
      debrief:
        'Genetic information needs interpretation within the medication plan. Avoid translating an association into a dose change without the patient-specific evidence and prescribing review.',
    },
    4
  ),
  item(
    {
      id: 'v2-genetics-c-negative',
      topic: 'An uninformative negative family test',
      level: 'challenge',
      scenario:
        'An unaffected adult has a negative hereditary cancer panel. A sibling had colorectal cancer at age 38 but has not had genetic testing. The family has no previously identified pathogenic variant. The patient asks to cancel enhanced surveillance planned from the family history. The nurse is preparing the follow-up discussion.',
      cues: [
        'The tested patient is unaffected.',
        'A sibling developed colorectal cancer at age 38.',
        'No familial pathogenic variant has been identified.',
        'The patient plans to stop history-based surveillance after a negative panel.',
      ],
      question:
        'How should the negative panel affect the plan to cancel family-history-based surveillance?',
      options: [
        right(
          'Maintain the history-based plan pending genetics review of the result and possible testing of the affected sibling.',
          'Without an established familial variant, a negative panel can be uninformative. Review should integrate the pedigree and test scope; testing an affected relative may clarify the family’s risk without treating the current result as an all-clear.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Use the negative panel to return to routine surveillance and revisit genetics if another relative is diagnosed.',
          'This treats an uninformative negative as a true negative and discounts the existing early-onset diagnosis. Waiting for another family diagnosis is not a sound reason to abandon the current history-based plan.',
          'A negative report and absence of an identified family variant may seem reassuring enough to reduce surveillance.',
          'premature_closure',
          [1, 2, 3]
        ),
        wrong(
          'Repeat the same panel in the unaffected patient before deciding whether the surveillance plan is necessary.',
          'Repeating an unchanged test is less informative than reviewing its scope and considering the affected sibling. It also makes a new test a prerequisite for a risk discussion already supported by history.',
          'A second negative result may seem to provide independent confirmation.',
          'misprioritization',
          [0, 1, 2]
        ),
        wrong(
          'Treat the sibling’s early diagnosis as evidence of a familial variant and arrange variant testing for other relatives.',
          'The history warrants assessment but does not establish a specific pathogenic variant. Targeted family testing requires an appropriately identified familial finding.',
          'Early-onset cancer strongly raises concern and can tempt the learner to infer a confirmed variant.',
          'cue_misinterpretation',
          [1, 2]
        ),
      ],
      reasoning: [
        'Determine whether the negative test can be interpreted against a known familial variant.',
        'Integrate unresolved family risk with surveillance and the most informative next assessment.',
      ],
      debrief:
        'A negative result has meaning in relation to what the test could detect. Use the family history and the presence or absence of an established familial variant to guide follow-up.',
    },
    5
  ),
  item(
    {
      id: 'v2-genetics-c-privacy',
      topic: 'Family involvement and voluntary consent',
      level: 'challenge',
      scenario:
        'An adult arrives for predictive testing with a parent. The parent answers most questions and says testing must happen before a family event next week. The patient quietly tells the nurse that they want time to consider the result’s implications. The sample has not been collected. The patient has decision-making capacity.',
      cues: [
        'The parent is directing the conversation.',
        'A family event creates pressure to test this week.',
        'The competent patient wants more time.',
        'No sample has been collected.',
      ],
      question:
        'How should the nurse proceed when the patient wants more time but the parent expects testing today?',
      options: [
        right(
          'Offer a private discussion, clarify the patient’s preferences and arrange a later decision if desired.',
          'A private conversation helps establish the patient’s own understanding and voluntary choice in the presence of family pressure. Testing can be deferred while preserving access to counseling and family involvement chosen by the patient.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Complete counseling with both people and ask the parent to confirm that the patient is ready for testing.',
          'A family discussion can be useful, but parent confirmation does not establish the competent adult’s voluntary consent and may reinforce the pressure already described.',
          'The parent may provide practical support and appear more confident about the decision.',
          'cue_misinterpretation',
          [0, 2]
        ),
        wrong(
          'Collect the sample today and hold its release while the patient considers whether they want the result.',
          'This advances the testing process before resolving the patient’s choice. With no specimen collected, a private consent discussion is more appropriate than creating a new release decision.',
          'Holding the result may seem to balance family urgency with patient uncertainty.',
          'misprioritization',
          [2, 3]
        ),
        wrong(
          'Use the approaching family event to agree a testing date and address privacy concerns after collection.',
          'A family deadline does not determine the patient’s readiness. The expressed wish for time should be addressed before committing to collection or disclosure.',
          'A specific date may seem a practical way to move an emotionally difficult decision forward.',
          'premature_closure',
          [1, 2]
        ),
      ],
      reasoning: [
        'Recognize the difference between supportive family involvement and pressure on consent.',
        'Prioritize private clarification of the patient’s choice before specimen collection.',
      ],
      debrief:
        'Person-centered genetic care includes control over whether and when to test. Resolve pressure and understanding before proceeding with a technically convenient plan.',
    },
    6
  ),
  item(
    {
      id: 'v2-genetics-c-recontact',
      topic: 'New family information after an uncertain result',
      level: 'challenge',
      scenario:
        'A patient had an uncertain variant reported three years ago. The original report recommended periodic review through the genetics service. A first-degree relative has now developed a related cancer at an unusually young age. The patient has not contacted the genetics team since the original result. They ask whether the old report still settles the issue.',
      cues: [
        'The original variant classification was uncertain.',
        'The report is three years old and recommended review.',
        'A close relative has a new early-onset diagnosis.',
        'There has been no genetics follow-up.',
      ],
      question:
        'What follow-up is needed after a new early-onset family cancer and an older uncertain result?',
      options: [
        right(
          'Update the pedigree and request genetics review of the current classification, test scope and family findings.',
          'New family information and possible laboratory reclassification can change interpretation and follow-up needs. Updating the history and reviewing the actual report are more useful than presuming either a pathogenic result or a permanently settled uncertainty.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Treat the new diagnosis as confirmation that the uncertain variant is pathogenic and update relatives’ risk labels.',
          'A related cancer increases concern but does not establish variant pathogenicity. Classification requires appropriate evidence and review rather than a direct inference from one new diagnosis.',
          'The new diagnosis appears to fit the suspected inherited pattern.',
          'premature_closure',
          [0, 2]
        ),
        wrong(
          'Use the original uncertain classification until the laboratory sends an unsolicited amended report.',
          'This relies on outdated information despite a planned review and an important pedigree change. Recontact can be appropriate even without an unsolicited laboratory notice.',
          'Laboratory reports are authoritative and learners may assume automatic updates are comprehensive.',
          'outdated_data',
          [1, 2, 3]
        ),
        wrong(
          'Order the same panel again before requesting review so the genetics team has a recent specimen result.',
          'A new specimen is not automatically needed to review classification, test coverage or family data. Reviewing the existing report and updated history should determine the appropriate next test, if any.',
          'A recent test date may be mistaken for a more current interpretation.',
          'misprioritization',
          [0, 1, 2]
        ),
      ],
      reasoning: [
        'Recognize that variant classification and family history may change over time.',
        'Choose a coordinated update that determines whether additional testing or surveillance changes are warranted.',
      ],
      debrief:
        'Follow-up is an information-management task as well as a testing task. New diagnoses and older uncertain reports should trigger review of the evidence rather than automatic reclassification or reflex repeat testing.',
    },
    7
  ),
  item(
    {
      id: 'v2-genetics-c-report',
      topic: 'Verifying a reported familial variant',
      level: 'challenge',
      scenario:
        'A patient reports that a cousin has a cancer gene. A screenshot shows the gene name but omits the variant and classification. The patient has been offered a broad direct-to-consumer test by a friend. A genetics visit is scheduled next month. They ask which result the clinical team needs to plan useful testing.',
      cues: [
        'The reported familial finding is based on an incomplete screenshot.',
        'The variant and classification are missing.',
        'The proposed consumer test may have different coverage.',
        'A genetics consultation is already planned.',
      ],
      question:
        'Which record is most important before choosing a test for the reported familial finding?',
      options: [
        right(
          'With permission, obtain the relative’s clinical report showing the exact variant and classification for genetics review.',
          'The exact familial finding and its classification determine whether targeted clinical testing is appropriate. A gene name alone does not identify the variant or establish that a consumer test includes it.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Obtain the consumer test’s overall cancer-risk score and compare it with the cousin’s gene name.',
          'An overall consumer score cannot substitute for verifying a specific clinical familial variant. The tests may measure different things and have different coverage.',
          'A numerical risk score may appear easier to compare across relatives than a detailed report.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
        wrong(
          'Obtain a fresh blood sample for the broadest available panel before the genetics appointment.',
          'A broader panel is not automatically the most informative next step. Clarifying the family’s actual finding can guide targeted testing and reduce uncertain findings.',
          'More extensive testing may seem preferable when the family report is incomplete.',
          'misprioritization',
          [1, 3]
        ),
        wrong(
          'Obtain the cousin’s surveillance schedule and use it to choose the patient’s testing pathway.',
          'The cousin’s plan may reflect personal disease, a specific variant or other risk factors. It cannot replace confirming the actual report and assessing this patient’s history.',
          'A relative’s established care plan may seem like a ready-made pathway for the family.',
          'premature_closure',
          [0, 1]
        ),
      ],
      reasoning: [
        'Identify what evidence is missing from the reported family result.',
        'Prioritize verification of the familial finding before selecting a testing strategy.',
      ],
      debrief:
        'A reported gene name is a starting point, not a complete familial diagnosis. Verify the exact clinical finding and test coverage before translating another person’s result into this patient’s plan.',
    },
    8
  ),
  item(
    {
      id: 'v2-genetics-c-medicine',
      topic: 'A new genetic report during medication review',
      level: 'challenge',
      scenario:
        'A patient brings a pharmacogenetic report to a medication visit. The report flags a currently prescribed drug for clinician review. The patient began another medicine last week and now reports dizziness. They have not changed either dose. The nurse must decide what information to bring to the prescriber and pharmacist.',
      cues: [
        'A clinical pharmacogenetic report flags a prescribed medicine.',
        'Another medicine was added last week.',
        'Dizziness appeared after that change.',
        'The prescribed doses have not been independently changed.',
      ],
      question:
        'What information should guide the review of dizziness after the new medicine was started?',
      options: [
        right(
          'Review the exact report, complete medication list, symptom timing and relevant clinical observations together.',
          'The report may inform therapy, but interactions, timing and the current examination also affect the explanation for dizziness. An integrated review supports an appropriate prescribing decision without assuming a genetic cause.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Review the flagged gene–drug pair first and attribute the dizziness to reduced metabolism of that drug.',
          'This narrows the explanation before considering the newly added medicine and other clinical findings. A genetic association does not prove that it caused this symptom.',
          'A new report provides a compelling explanation that appears more individualized than interaction review.',
          'premature_closure',
          [0, 1, 2]
        ),
        wrong(
          'Review the new medicine as the cause and keep the genetic report for the next scheduled annual visit.',
          'The new medicine is relevant, but excluding the report without review discards potentially useful information. Both medication changes and genetic evidence should be considered in the current assessment.',
          'The symptom timing strongly points toward the most recently changed treatment.',
          'misprioritization',
          [0, 1, 2]
        ),
        wrong(
          'Review whether the patient tolerated the flagged drug previously and use that history to clear the interaction concern.',
          'Prior tolerance does not resolve a new interaction or current symptoms. The current medicine combination and patient condition may differ from the earlier stable period.',
          'Previous long-term tolerance can feel like stronger evidence than a new laboratory report.',
          'outdated_data',
          [0, 1, 2]
        ),
      ],
      reasoning: [
        'Integrate the timing of symptoms with medication changes and the genetic report.',
        'Prepare a supervised review that tests competing explanations rather than attributing the symptom to one finding.',
      ],
      debrief:
        'Pharmacogenetics adds evidence to medication assessment. It does not replace symptom evaluation, medication reconciliation or attention to a recent change in treatment.',
    },
    9
  ),
  item(
    {
      id: 'v2-genetics-a-negative',
      topic: 'New symptoms during unresolved inherited-risk assessment',
      level: 'advanced',
      scenario:
        'A 42-year-old has a negative hereditary cancer panel without an established familial variant. Their sibling developed colorectal cancer at 38. Over six weeks the patient has developed intermittent rectal bleeding, changed bowel habits and unintentional weight loss. Hemoglobin has fallen from 13.1 to 10.2 g/dL, although blood pressure is stable and there is no brisk current bleeding. A stool FIT obtained last month was below the local referral threshold. A genetics appointment is six weeks away, and the patient asks to postpone further assessment until that visit.',
      referenceUrls: [
        'https://www.nice.org.uk/guidance/ng12/chapter/recommendations-organised-by-site-of-cancer',
      ],
      cues: [
        'Negative hereditary panel without a known familial variant',
        'A sibling had early-onset colorectal cancer.',
        'Persistent rectal bleeding and changed bowel habits',
        'Unintentional weight loss',
        'Falling hemoglobin despite preserved blood pressure',
        'An earlier stool FIT below the local threshold',
        'The patient proposes waiting six weeks for a genetics visit.',
      ],
      question:
        'How should the new symptoms change the timing and purpose of follow-up while inherited risk remains unresolved?',
      options: [
        right(
          'Arrange prompt symptom-directed clinical assessment while keeping inherited-risk review on a separate pathway.',
          'Persistent bleeding, changed bowel habits, weight loss and falling hemoglobin need diagnostic assessment of the current problem. A negative hereditary panel does not exclude sporadic disease, and a below-threshold FIT does not resolve strong concern from ongoing unexplained symptoms. The genetics review remains useful but should not delay this assessment.',
          [0, 1, 2, 3, 4, 5, 6]
        ),
        wrong(
          'Request repeat stool and iron studies as prerequisites to referral while addressing likely iron deficiency.',
          'Additional studies can contribute, but making them a gate to clinical review delays assessment of a persistent concerning symptom cluster. A prior below-threshold result is not sufficient reassurance when clinical concern remains.',
          'Repeating an initially reassuring noninvasive test and treating anemia can seem a proportionate first step in a stable patient.',
          'misprioritization',
          [2, 3, 4, 5]
        ),
        wrong(
          'Expedite an expanded hereditary panel so its result can determine the next diagnostic investigation.',
          'The current symptoms require assessment irrespective of whether another inherited variant is found. Expanding a risk test does not diagnose or exclude the present cause of bleeding and anemia.',
          'The early family diagnosis and limitations of the negative panel make unresolved inherited risk feel like the central diagnostic question.',
          'premature_closure',
          [0, 1, 2, 4, 6]
        ),
        wrong(
          'Bring forward routine risk-based surveillance and reassess the bleeding once that surveillance pathway is scheduled.',
          'Moving surveillance earlier may sound responsive, but the current symptom cluster needs a diagnostic review with an appropriate urgency decision. Screening and surveillance schedules do not substitute for assessment of a new symptomatic problem.',
          'A higher-risk family history can make an earlier surveillance appointment appear to address both inherited risk and new symptoms.',
          'cue_misinterpretation',
          [1, 2, 3, 4, 6]
        ),
      ],
      reasoning: [
        'Distinguish inherited-risk assessment and surveillance from diagnosis of a current symptomatic problem.',
        'Weigh persistent symptoms and a hemoglobin trend against negative or below-threshold tests that answer more limited questions.',
        'Prioritize diagnostic clinical review without abandoning the separate inherited-risk follow-up.',
      ],
      conflict:
        'Negative genetic testing, an earlier below-threshold FIT and stable pressure appear reassuring, while persistent symptoms, weight loss and falling hemoglobin sustain concern.',
      anticipation:
        'Ensure the symptomatic referral is acted on and provide a team-agreed safety net for increasing bleeding, faintness or further deterioration while assessment proceeds.',
      uncertainty:
        'These findings do not establish cancer or an inherited syndrome; they establish a need for diagnostic assessment rather than reassurance from risk tests.',
      debrief:
        'Advanced reasoning identifies when the clinical question has changed. A test about inherited susceptibility and a prior stool result cannot settle a new symptomatic presentation with a worsening blood-count trend.',
    },
    10
  ),
  item(
    {
      id: 'v2-genetics-a-vus',
      topic: 'Separating variant uncertainty from clinical risk',
      level: 'advanced',
      scenario:
        'A patient with a strong family history receives a variant of uncertain significance. An online discussion describes the same gene as a high-risk cancer gene. The patient requests an irreversible risk-reducing procedure because of the report. Their family-history risk assessment is not yet complete. No pathogenic familial variant has been established. The surgeon asks the nurse to clarify the patient’s understanding before multidisciplinary review.',
      cues: [
        'The specific variant is classified as uncertain.',
        'The gene has recognized disease associations.',
        'The patient is considering an irreversible procedure.',
        'The family history may independently affect risk.',
        'The formal risk assessment is incomplete.',
        'There is no confirmed familial pathogenic variant.',
      ],
      question:
        'Which assessment should precede a risk-reducing procedure requested because of this uncertain variant?',
      options: [
        right(
          'Assess history-based risk and patient preferences with the team, separating that assessment from the uncertain variant.',
          'The gene’s association does not establish this variant as disease-causing. The team should assess independent risk and the procedure’s benefits and harms with the patient; the uncertain variant alone should not determine the irreversible intervention.',
          [0, 1, 2, 3, 4, 5]
        ),
        wrong(
          'Use the gene’s established association to support the procedure while the laboratory gathers variant-level evidence.',
          'A gene-level association cannot substitute for evidence about this particular variant. Acting on that inference can expose the patient to irreversible harm without the required risk assessment.',
          'A known high-risk gene plus a compelling family history can make waiting for variant evidence feel unnecessarily cautious.',
          'cue_misinterpretation',
          [0, 1, 2, 4]
        ),
        wrong(
          'Use the uncertain classification to defer the risk discussion until the laboratory upgrades or downgrades the variant.',
          'The patient’s family history and preferences still require assessment now. Waiting for reclassification ignores independently relevant risk and a current decision request.',
          'Deferring until a clearer laboratory result appears to avoid an irreversible decision under uncertainty.',
          'misprioritization',
          [0, 2, 3, 4]
        ),
        wrong(
          'Repeat testing in another laboratory and base the procedural discussion on whether the same variant is detected again.',
          'Repeated detection confirms presence, not pathogenicity. A second report does not replace variant interpretation or assessment of the patient’s independent risk.',
          'Independent confirmation sounds like a rigorous way to settle uncertainty before surgery.',
          'premature_closure',
          [0, 2, 4, 5]
        ),
      ],
      reasoning: [
        'Separate gene-level disease association from the classification of the individual variant.',
        'Integrate independent risk, the irreversibility of the decision and patient preferences in a multidisciplinary evaluation.',
      ],
      conflict:
        'A concerning pedigree and a well-known gene coexist with an uncertain variant that cannot independently justify an irreversible procedure.',
      anticipation:
        'Plan follow-up for reclassification and update the risk discussion when verified evidence changes, while addressing the patient’s current concern.',
      uncertainty:
        'Neither the need for the procedure nor the patient’s overall risk can be determined from this variant report alone.',
      debrief:
        'Keep variant interpretation and whole-person risk assessment connected without collapsing them into the same claim. A cautious interpretation of the variant must still allow timely assessment of independently important risk.',
    },
    11
  ),
  item(
    {
      id: 'v2-genetics-a-disclosure',
      topic: 'Disclosure preferences under family pressure',
      level: 'advanced',
      scenario:
        'An adult has a confirmed inherited finding relevant to relatives. The patient understands the result but wants time before sharing it with a sibling. A relative asks the nurse to send the report directly and says the sibling’s appointment is tomorrow. The patient is distressed about a family conflict and has not authorized disclosure. The genetics service can offer a family letter and counseling. There is no immediate emergency described.',
      cues: [
        'A confirmed result may matter to relatives.',
        'The patient understands the finding.',
        'The patient has not authorized disclosure.',
        'A relative is pressuring the team because of a near-term appointment.',
        'The patient is distressed by family conflict.',
        'Counseling and a patient-controlled family letter are available.',
      ],
      question:
        'How should the nurse handle the request to send this genetic report before the sibling’s appointment?',
      options: [
        right(
          'Clarify consent privately, offer supported family communication and seek privacy guidance if a disclosure concern remains.',
          'The relative’s deadline does not establish permission to disclose. A private conversation can support the patient’s understanding, concerns and chosen communication while the team follows applicable privacy policy and seeks expert advice for any unresolved duty question.',
          [0, 1, 2, 3, 4, 5]
        ),
        wrong(
          'Send a limited gene summary to the sibling’s team and discuss full-report permission with the patient afterward.',
          'Even a limited summary may disclose protected information without authorization. The stated benefit and deadline do not by themselves resolve the patient’s consent or the applicable privacy requirements.',
          'Limited disclosure can appear to preserve privacy while helping a relative at a time-sensitive visit.',
          'misprioritization',
          [0, 2, 3]
        ),
        wrong(
          'Document the refusal and end discussion of family communication until the patient independently requests it.',
          'Respecting the current decision does not require withdrawing support. Exploring concerns and offering patient-controlled communication can preserve autonomy and potential family benefit without coercion.',
          'Ending the discussion may seem the clearest way to avoid pressuring a distressed patient.',
          'premature_closure',
          [1, 4, 5]
        ),
        wrong(
          'Ask the requesting relative to obtain the sibling’s consent and use that consent to release the patient’s report.',
          'The sibling’s agreement to receive information does not authorize disclosure of this patient’s report. The source patient’s preferences and relevant privacy rules remain central.',
          'Consent from the intended recipient may be mistaken for permission to share the source record.',
          'cue_misinterpretation',
          [0, 2, 3]
        ),
      ],
      reasoning: [
        'Distinguish potential family benefit from authorization to disclose this patient’s information.',
        'Support a voluntary communication plan and identify when local privacy or ethics expertise is needed.',
      ],
      conflict:
        'The result could benefit relatives soon, while the informed patient has not authorized sharing and is experiencing family pressure.',
      anticipation:
        'Agree a follow-up opportunity for disclosure support and document preferences so a family deadline does not lead to an unintended release.',
      uncertainty:
        'The scenario does not establish a legal exception to confidentiality; unresolved duties require the relevant institutional and jurisdictional guidance.',
      debrief:
        'Advanced person-centered reasoning holds two legitimate interests in view. Support the potential benefit to relatives through consent-based communication and appropriate expert guidance rather than inferring permission from urgency.',
    },
    12
  ),
  item(
    {
      id: 'v2-genetics-a-drug',
      topic: 'Genetic information during a changing toxicity risk',
      level: 'advanced',
      scenario:
        'An older adult has taken the same medicine for years without reported adverse effects. A clinical pharmacogenetic report identifies a potentially relevant metabolism finding. During the past week the patient developed an acute illness with reduced kidney function. A second medicine with a possible interaction was also started. The patient now reports new somnolence and unsteadiness. The nurse is assembling an urgent medication review with the prescriber and pharmacist.',
      cues: [
        'The medicine was previously tolerated.',
        'A clinical genetic report may affect interpretation of metabolism.',
        'An acute illness has changed the patient’s condition.',
        'Kidney function has declined.',
        'A potentially interacting medicine was added.',
        'New somnolence and unsteadiness suggest current harm.',
      ],
      question:
        'What should the urgent medication review establish about the new somnolence and unsteadiness?',
      options: [
        right(
          'Assess current toxicity and competing acute causes, integrating organ function, interactions and the exact genetic finding.',
          'Current symptoms require prompt assessment, while organ function and an interaction can change exposure despite earlier tolerance. The genetic result may contribute, but a coordinated review must evaluate the actual medicines and other acute causes before attributing the problem or selecting a dose change.',
          [0, 1, 2, 3, 4, 5]
        ),
        wrong(
          'Prioritize confirmation of the genetic phenotype and use that result to explain the new symptoms before reviewing interactions.',
          'This gives the genetic finding precedence over current clinical assessment, kidney change and a new interaction. Confirmation may matter, but it should not delay evaluation of current harm or competing causes.',
          'A patient-specific genetic report can appear to offer a more precise explanation than a multifactorial review.',
          'premature_closure',
          [1, 3, 4, 5]
        ),
        wrong(
          'Use the long period of prior tolerance to focus the review on the new medicine and exclude the established prescription.',
          'Previous tolerance does not clear the established medicine when clearance, illness and interactions have changed. The full regimen may now contribute to harm.',
          'The only recent prescribing change is an intuitive first suspect for the new symptoms.',
          'outdated_data',
          [0, 3, 4, 5]
        ),
        wrong(
          'Use the genetic report to recommend a proportional reduction in the established medicine while arranging kidney follow-up.',
          'A proportional change cannot be inferred from a generic association. The current symptoms and interaction require supervised assessment of the exact drug, report and patient condition rather than an independent genetic-dose calculation.',
          'Reducing exposure sounds protective and appears to act on the report without stopping treatment completely.',
          'cue_misinterpretation',
          [1, 3, 4, 5]
        ),
      ],
      reasoning: [
        'Recognize that earlier tolerance does not account for changed clearance and interacting treatment.',
        'Evaluate multiple causes of current harm and use genetics as one part of the supervised medication decision.',
      ],
      conflict:
        'Long prior tolerance is reassuring, but current symptoms, organ dysfunction and a new interaction suggest a substantially different risk state.',
      anticipation:
        'Monitor the clinical trajectory and reassess after team-directed changes, with escalation for worsening consciousness or other acute deterioration.',
      uncertainty:
        'The actual drug, concentration, genotype interpretation and examination are needed before assigning a cause or specifying a dose change.',
      debrief:
        'Clinical context changes the meaning of a stable prescription. Integrate genetic evidence with the current patient and regimen, and evaluate harm before choosing a narrow causal explanation.',
    },
    13
  ),
  item(
    {
      id: 'v2-genetics-a-coverage',
      topic: 'A negative consumer result and a known familial variant',
      level: 'advanced',
      scenario:
        'A patient brings a consumer report showing no detected variant in a cancer-associated gene. Their sibling has a clinical report identifying a pathogenic variant in that gene. The consumer report states that selected variants were tested rather than the full gene. The patient does not know whether the sibling’s exact variant was included. There is also a family history of early-onset cancer. The patient asks to cancel a clinical genetics appointment because both reports mention the same gene.',
      cues: [
        'The sibling has a clinically identified pathogenic variant.',
        'The consumer report lists no detected variant.',
        'Only selected variants were assessed by the consumer test.',
        'Coverage of the sibling’s exact variant is unknown.',
        'The family has early-onset cancer.',
        'The patient wants to cancel clinical follow-up.',
      ],
      question:
        'How should the team determine whether the consumer result excludes the sibling’s familial variant?',
      options: [
        right(
          'Verify the exact familial variant and consumer coverage, then arrange appropriate clinical evaluation before changing follow-up.',
          'A negative result is informative only for variants the test can assess. Matching the gene name does not show coverage of the familial variant; verified reports can guide targeted clinical testing and interpretation of family risk.',
          [0, 1, 2, 3, 4, 5]
        ),
        wrong(
          'Accept the negative consumer result as a true negative because both reports evaluated the same named gene.',
          'The same gene name does not establish the same variant coverage. Treating the reports as equivalent may falsely reassure a person whose familial variant was never assessed.',
          'Two reports naming the same gene appear directly comparable.',
          'cue_misinterpretation',
          [0, 1, 2, 3]
        ),
        wrong(
          'Treat the sibling’s result as proof that this patient carries the variant and proceed with a carrier-specific care plan.',
          'A relative’s result establishes a familial finding, not this patient’s genotype. Clinical evaluation and appropriate testing are needed before assigning the individual result.',
          'A confirmed family finding and early cancer history create a compelling risk signal.',
          'premature_closure',
          [0, 4, 5]
        ),
        wrong(
          'Repeat the consumer test with a fresh specimen and use concordant negatives to cancel the genetics appointment.',
          'Repeating the same limited test cannot correct absent variant coverage. Two negative reports may reproduce the same blind spot rather than resolve the discrepancy.',
          'Repeated testing feels like independent confirmation and appears easier than a clinical referral.',
          'misprioritization',
          [1, 2, 3, 5]
        ),
      ],
      reasoning: [
        'Compare what each report actually tested rather than comparing gene names.',
        'Determine whether the negative result addresses the familial variant and choose a clinical confirmation pathway.',
      ],
      conflict:
        'The negative consumer report appears to contradict a clinically confirmed family finding, but variant coverage has not been established.',
      anticipation:
        'Preserve appropriate follow-up until a verified clinical interpretation addresses the familial variant and the patient’s risk.',
      uncertainty:
        'The patient’s carrier status cannot be inferred from either the sibling’s result or this limited negative report alone.',
      debrief:
        'Evaluate test coverage before interpreting disagreement. A negative finding can be falsely reassuring when the clinically relevant target was not included in the test.',
    },
    14
  ),
]
