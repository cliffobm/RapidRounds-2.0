import type { AnswerOption, ClinicalJudgmentStep, ItemWithOptions } from '../lib/domain/types';
import { CARDIAC_ITEMS, CARDIAC_SCENARIOS } from './cardiac-pack';

export interface LearningItem extends ItemWithOptions {
  contentVersion: string;
  conceptId: string;
  conceptLabel: string;
  conceptTags: string[];
  learningObjective: string;
  legacyId: string;
  options: (AnswerOption & { legacyOptionId: string })[];
}

/** Organizational tags are provisional; they do not imply clinical approval. */
export const catalogConcepts: { id: string; label: string; description: string }[] = [
  { id: 'perfusion', label: 'Perfusion & priorities', description: 'Assessment cues, changing stability, and priorities in the existing cardiac scenarios.' },
  { id: 'cardiac-assessment', label: 'ECG & cardiac assessment', description: 'ECG territory patterns, additional assessment, and biomarkers in the existing items.' },
  { id: 'medication-safety', label: 'Medication safety', description: 'Medication choices, contraindication screens, and monitoring in the existing cardiac items.' },
  { id: 'oxygenation-fluid', label: 'Oxygenation & fluid balance', description: 'Respiratory changes, congestion cues, and therapy monitoring in the existing scenarios.' },
  { id: 'rhythm-stability', label: 'Rhythm & stability', description: 'Rhythm assessment, symptoms, stability, and escalation in the existing AF items.' },
  { id: 'self-management', label: 'Teaching & handoff', description: 'Self-monitoring, risk discussions, discharge teaching, and clinical communication.' },
];

type EditorialEntry = {
  id: string;
  scenarioId: string;
  /** Permanent migration alias: never rewrite when correcting the original stem. */
  legacyId: string;
  /** Source join only. Update this if source wording changes; keep id and legacyId. */
  sourceStem: string;
  conceptId: string;
  clinicalJudgmentStep: ClinicalJudgmentStep;
  learningObjective: string;
};

/**
 * Checked-in editorial IDs and original aliases, not IDs derived from array position
 * or current wording. For a wording revision, update sourceStem and bump the affected
 * content version when reviewed; preserve the ID and original migration alias.
 * Source joins fail loudly so unregistered content cannot silently acquire new IDs.
 */
const editorialManifest: EditorialEntry[] = [
  {
    "id": "rr-cardiac-001",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:A%20patient%20with%20inferior%20STEMI%20is%20hypotensive%2C%20cool%2C%20and%20clear%20on%20lung%20exam.%20Which%20finding%20best%20prompts%20evaluation%20for%20RV%20infarct%E2%80%93related%20preload%20dependence%3F",
    "sourceStem": "A patient with inferior STEMI is hypotensive, cool, and clear on lung exam. Which finding best prompts evaluation for RV infarct–related preload dependence?",
    "conceptId": "perfusion",
    "clinicalJudgmentStep": "analyze_cues",
    "learningObjective": "Connect the assessment cues in this item with a perfusion concern."
  },
  {
    "id": "rr-cardiac-002",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:Which%20additional%20ECG%20acquisition%20is%20most%20appropriate%20when%20inferior%20STEMI%20and%20RV%20involvement%20are%20suspected%3F",
    "sourceStem": "Which additional ECG acquisition is most appropriate when inferior STEMI and RV involvement are suspected?",
    "conceptId": "cardiac-assessment",
    "clinicalJudgmentStep": "generate_solutions",
    "learningObjective": "Identify the additional ECG assessment described in this item."
  },
  {
    "id": "rr-cardiac-003",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:STEMI%20with%20suspected%20RV%20involvement%20and%20hypotension.%20Which%20intervention%20is%20most%20likely%20contraindicated%20due%20to%20preload%20sensitivity%3F",
    "sourceStem": "STEMI with suspected RV involvement and hypotension. Which intervention is most likely contraindicated due to preload sensitivity?",
    "conceptId": "medication-safety",
    "clinicalJudgmentStep": "generate_solutions",
    "learningObjective": "Identify a medication-related risk in the clinical context presented."
  },
  {
    "id": "rr-cardiac-004",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:Inferior%20STEMI%20with%20bradycardia%20and%20symptomatic%20hypotension.%20Which%20first-line%20medication%20is%20most%20commonly%20protocol-aligned%20for%20symptomatic%20brady%3F",
    "sourceStem": "Inferior STEMI with bradycardia and symptomatic hypotension. Which first-line medication is most commonly protocol-aligned for symptomatic brady?",
    "conceptId": "medication-safety",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Distinguish the medication choices in this symptomatic bradycardia item."
  },
  {
    "id": "rr-cardiac-005",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:Which%20pattern%20most%20classically%20supports%20inferior%20wall%20involvement%20on%20ECG%20(high-yield%20teaching%20pattern)%3F",
    "sourceStem": "Which pattern most classically supports inferior wall involvement on ECG (high-yield teaching pattern)?",
    "conceptId": "cardiac-assessment",
    "clinicalJudgmentStep": "recognize_cues",
    "learningObjective": "Recognize the ECG territory pattern presented in this item."
  },
  {
    "id": "rr-cardiac-006",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:During%20rapid%20assessment%2C%20which%20symptom%20cluster%20most%20strongly%20prompts%20immediate%20escalation%20alongside%20STEMI%20activation%3F",
    "sourceStem": "During rapid assessment, which symptom cluster most strongly prompts immediate escalation alongside STEMI activation?",
    "conceptId": "perfusion",
    "clinicalJudgmentStep": "prioritize_hypotheses",
    "learningObjective": "Distinguish acute changes from lower-priority findings in this item."
  },
  {
    "id": "rr-cardiac-007",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:Which%20laboratory%20trend%20is%20most%20commonly%20monitored%20serially%20to%20evaluate%20myocardial%20injury%20in%20suspected%20ACS%3F",
    "sourceStem": "Which laboratory trend is most commonly monitored serially to evaluate myocardial injury in suspected ACS?",
    "conceptId": "cardiac-assessment",
    "clinicalJudgmentStep": "recognize_cues",
    "learningObjective": "Identify the laboratory marker relevant to the question presented."
  },
  {
    "id": "rr-cardiac-008",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:Your%20patient%20with%20inferior%20STEMI%20develops%20acute%20pulmonary%20edema.%20Which%20concept%20best%20explains%20a%20sudden%20shift%20toward%20LV%20overload%20during%20evolving%20MI%3F",
    "sourceStem": "Your patient with inferior STEMI develops acute pulmonary edema. Which concept best explains a sudden shift toward LV overload during evolving MI?",
    "conceptId": "oxygenation-fluid",
    "clinicalJudgmentStep": "analyze_cues",
    "learningObjective": "Connect an evolving respiratory finding with the mechanism described in this item."
  },
  {
    "id": "rr-cardiac-009",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:Which%20assessment%20pairing%20best%20supports%20adequate%20perfusion%20during%20ongoing%20chest%20pain%20care%3F",
    "sourceStem": "Which assessment pairing best supports adequate perfusion during ongoing chest pain care?",
    "conceptId": "perfusion",
    "clinicalJudgmentStep": "recognize_cues",
    "learningObjective": "Identify the assessment cues used to track perfusion in this item."
  },
  {
    "id": "rr-cardiac-010",
    "scenarioId": "scenario-inferior-stemi-rv",
    "legacyId": "scenario-inferior-stemi-rv:Before%20adjunct%20therapies%2C%20which%20safety%20screen%20is%20most%20commonly%20emphasized%20prior%20to%20nitrate%20administration%20in%20suspected%20ACS%3F",
    "sourceStem": "Before adjunct therapies, which safety screen is most commonly emphasized prior to nitrate administration in suspected ACS?",
    "conceptId": "medication-safety",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Identify the medication safety screen described in this item."
  },
  {
    "id": "rr-cardiac-011",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:ADHF%20with%20orthopnea%20and%20bibasilar%20crackles.%20Which%20immediate%20nursing%20priority%20best%20supports%20oxygenation%20while%20coordinating%20advanced%20care%3F",
    "sourceStem": "ADHF with orthopnea and bibasilar crackles. Which immediate nursing priority best supports oxygenation while coordinating advanced care?",
    "conceptId": "oxygenation-fluid",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Compare the proposed actions for the respiratory presentation in this item."
  },
  {
    "id": "rr-cardiac-012",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Which%20finding%20best%20reflects%20volume%20overload%20on%20rapid%20nursing%20assessment%3F",
    "sourceStem": "Which finding best reflects volume overload on rapid nursing assessment?",
    "conceptId": "oxygenation-fluid",
    "clinicalJudgmentStep": "recognize_cues",
    "learningObjective": "Recognize the congestion cues presented in this item."
  },
  {
    "id": "rr-cardiac-013",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Which%20medication%20class%20is%20most%20commonly%20used%20IV%20for%20diuresis%20in%20acute%20decompensated%20HF%20per%20protocol%3F",
    "sourceStem": "Which medication class is most commonly used IV for diuresis in acute decompensated HF per protocol?",
    "conceptId": "medication-safety",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Distinguish the medication classes in this congestion-treatment item."
  },
  {
    "id": "rr-cardiac-014",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:A%20patient%20with%20ADHF%20becomes%20confused%20with%20poor%20urine%20output.%20Which%20issue%20should%20be%20escalated%20first%3F",
    "sourceStem": "A patient with ADHF becomes confused with poor urine output. Which issue should be escalated first?",
    "conceptId": "perfusion",
    "clinicalJudgmentStep": "prioritize_hypotheses",
    "learningObjective": "Identify the priority concern suggested by the changing assessment cues."
  },
  {
    "id": "rr-cardiac-015",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Which%20monitoring%20parameter%20best%20tracks%20ongoing%20respiratory%20effort%20and%20gas%20exchange%20during%20ADHF%20therapy%3F",
    "sourceStem": "Which monitoring parameter best tracks ongoing respiratory effort and gas exchange during ADHF therapy?",
    "conceptId": "oxygenation-fluid",
    "clinicalJudgmentStep": "evaluate_outcomes",
    "learningObjective": "Identify the respiratory measures used to follow the therapy response in this item."
  },
  {
    "id": "rr-cardiac-016",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Which%20teaching%20points%20align%20with%20daily%20congestion%20monitoring%20at%20home%20after%20stabilization%3F",
    "sourceStem": "Which teaching points align with daily congestion monitoring at home after stabilization?",
    "conceptId": "self-management",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Choose the self-monitoring teaching point described in this item."
  },
  {
    "id": "rr-cardiac-017",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Which%20assessment%20supports%20identification%20of%20flash%20pulmonary%20edema%20in%20ADHF%3F",
    "sourceStem": "Which assessment supports identification of flash pulmonary edema in ADHF?",
    "conceptId": "oxygenation-fluid",
    "clinicalJudgmentStep": "recognize_cues",
    "learningObjective": "Recognize the acute respiratory cues described in this item."
  },
  {
    "id": "rr-cardiac-018",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Which%20nursing%20intervention%20best%20reduces%20cardiac%20preload%20in%20acute%20volume%20overload%20while%20awaiting%20orders%3F",
    "sourceStem": "Which nursing intervention best reduces cardiac preload in acute volume overload while awaiting orders?",
    "conceptId": "oxygenation-fluid",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Compare the proposed positioning and fluid actions in this item."
  },
  {
    "id": "rr-cardiac-019",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Which%20lab%20trend%20commonly%20accompanies%20diuresis%20and%20guides%20electrolyte%20replacement%3F",
    "sourceStem": "Which lab trend commonly accompanies diuresis and guides electrolyte replacement?",
    "conceptId": "medication-safety",
    "clinicalJudgmentStep": "evaluate_outcomes",
    "learningObjective": "Identify the laboratory trends used for medication monitoring in this item."
  },
  {
    "id": "rr-cardiac-020",
    "scenarioId": "scenario-adhf",
    "legacyId": "scenario-adhf:Your%20patient%20on%20BiPAP%20becomes%20somnolent%20with%20rising%20CO2%20concerns%20per%20capnography.%20What%20is%20the%20priority%3F",
    "sourceStem": "Your patient on BiPAP becomes somnolent with rising CO2 concerns per capnography. What is the priority?",
    "conceptId": "oxygenation-fluid",
    "clinicalJudgmentStep": "prioritize_hypotheses",
    "learningObjective": "Identify the priority response to the respiratory changes presented."
  },
  {
    "id": "rr-cardiac-021",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:Telemetry%20shows%20an%20irregularly%20irregular%20rhythm%20without%20discernible%20P%20waves%20at%20150%20bpm.%20The%20patient%20is%20asymptomatic%20with%20stable%20vitals.%20Most%20appropriate%20immediate%20focus%3F",
    "sourceStem": "Telemetry shows an irregularly irregular rhythm without discernible P waves at 150 bpm. The patient is asymptomatic with stable vitals. Most appropriate immediate focus?",
    "conceptId": "rhythm-stability",
    "clinicalJudgmentStep": "analyze_cues",
    "learningObjective": "Connect the rhythm description with the assessment context in this item."
  },
  {
    "id": "rr-cardiac-022",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:AFib%20with%20RVR%20and%20hypotension%20with%20altered%20mental%20status.%20Which%20intervention%20matches%20urgent%20unstable%20tachycardia%20pathways%3F",
    "sourceStem": "AFib with RVR and hypotension with altered mental status. Which intervention matches urgent unstable tachycardia pathways?",
    "conceptId": "rhythm-stability",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Choose the pathway-aligned action for the unstable presentation described."
  },
  {
    "id": "rr-cardiac-023",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:Which%20medication%20class%20is%20commonly%20used%20for%20rate%20control%20when%20hemodynamics%20are%20stable%3F",
    "sourceStem": "Which medication class is commonly used for rate control when hemodynamics are stable?",
    "conceptId": "medication-safety",
    "clinicalJudgmentStep": "generate_solutions",
    "learningObjective": "Compare the rate-control options in the context presented."
  },
  {
    "id": "rr-cardiac-024",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:Which%20education%20point%20best%20supports%20stroke%20risk%20discussions%20in%20AF%3F",
    "sourceStem": "Which education point best supports stroke risk discussions in AF?",
    "conceptId": "self-management",
    "clinicalJudgmentStep": "generate_solutions",
    "learningObjective": "Identify the risk-discussion teaching point described in this item."
  },
  {
    "id": "rr-cardiac-025",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:During%20AF%20with%20RVR%2C%20which%20vital%20trend%20pair%20best%20signals%20inadequate%20perfusion%3F",
    "sourceStem": "During AF with RVR, which vital trend pair best signals inadequate perfusion?",
    "conceptId": "perfusion",
    "clinicalJudgmentStep": "recognize_cues",
    "learningObjective": "Recognize the perfusion trend pair presented in this item."
  },
  {
    "id": "rr-cardiac-026",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:Which%20action%20best%20prevents%20inappropriate%20cardioversion%20delays%20when%20the%20patient%20is%20unstable%3F",
    "sourceStem": "Which action best prevents inappropriate cardioversion delays when the patient is unstable?",
    "conceptId": "rhythm-stability",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Identify the escalation action described for an unstable rhythm."
  },
  {
    "id": "rr-cardiac-027",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:A%20patient%20converts%20to%20sinus%20rhythm%20after%20rate%20control.%20What%20is%20the%20priority%20teaching%20point%20prior%20to%20discharge%3F",
    "sourceStem": "A patient converts to sinus rhythm after rate control. What is the priority teaching point prior to discharge?",
    "conceptId": "self-management",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Identify the discharge teaching point presented in this item."
  },
  {
    "id": "rr-cardiac-028",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:Which%20laboratory%20consideration%20is%20most%20relevant%20when%20starting%20or%20adjusting%20AV%20nodal%20blockers%3F",
    "sourceStem": "Which laboratory consideration is most relevant when starting or adjusting AV nodal blockers?",
    "conceptId": "medication-safety",
    "clinicalJudgmentStep": "recognize_cues",
    "learningObjective": "Identify the laboratory consideration in this medication-monitoring item."
  },
  {
    "id": "rr-cardiac-029",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:Which%20scenario%20best%20warrants%20rhythm%20control%20strategy%20discussions%20versus%20rate%20control%20alone%3F",
    "sourceStem": "Which scenario best warrants rhythm control strategy discussions versus rate control alone?",
    "conceptId": "rhythm-stability",
    "clinicalJudgmentStep": "generate_solutions",
    "learningObjective": "Identify the symptom context for a therapy-strategy discussion."
  },
  {
    "id": "rr-cardiac-030",
    "scenarioId": "scenario-afib-rvr",
    "legacyId": "scenario-afib-rvr:During%20nursing%20handoff%20for%20AF%20with%20RVR%2C%20which%20data%20elements%20are%20essential%3F",
    "sourceStem": "During nursing handoff for AF with RVR, which data elements are essential?",
    "conceptId": "self-management",
    "clinicalJudgmentStep": "take_action",
    "learningObjective": "Distinguish relevant clinical handoff information in this item."
  }
];

const sourceByKey = new Map(CARDIAC_ITEMS.map((item) => [`${item.scenarioId}\u0000${item.stem}`, item]));
const conceptsById = new Map(catalogConcepts.map((concept) => [concept.id, concept]));
const scenariosById = new Set(CARDIAC_SCENARIOS.map((scenario) => scenario.id));

if (
  sourceByKey.size !== CARDIAC_ITEMS.length ||
  editorialManifest.length !== CARDIAC_ITEMS.length ||
  new Set(editorialManifest.map((entry) => entry.id)).size !== editorialManifest.length ||
  new Set(editorialManifest.map((entry) => entry.legacyId)).size !== editorialManifest.length ||
  new Set(editorialManifest.map((entry) => `${entry.scenarioId}\u0000${entry.sourceStem}`)).size !== editorialManifest.length
) {
  throw new Error('Cardiac editorial catalog must map each source item exactly once with a unique permanent ID.');
}

export const catalogItems: LearningItem[] = editorialManifest.map((entry) => {
  const source = sourceByKey.get(`${entry.scenarioId}\u0000${entry.sourceStem}`);
  const concept = conceptsById.get(entry.conceptId);
  if (!source || !concept || !scenariosById.has(entry.scenarioId)) {
    throw new Error(`Missing source, concept, or scenario for editorial item ${entry.id}. Review its source mapping.`);
  }
  if (new Set(source.options.map((option) => option.order)).size !== source.options.length) {
    throw new Error(`Duplicate option order in editorial item ${entry.id}.`);
  }
  return {
    ...source,
    id: entry.id,
    legacyId: entry.legacyId,
    contentVersion: '1',
    status: 'needs_review',
    conceptId: concept.id,
    conceptLabel: concept.label,
    conceptTags: [concept.id],
    clinicalJudgmentStep: entry.clinicalJudgmentStep,
    learningObjective: entry.learningObjective,
    options: source.options.map((option) => ({
      ...option,
      id: `${entry.id}:option:${option.order}`,
      itemId: entry.id,
      legacyOptionId: `${entry.legacyId}:option:${option.order}`,
    })),
  };
});

const itemAliases = new Map(catalogItems.map((item) => [item.legacyId, item.id]));
const optionAliases = new Map(
  catalogItems.flatMap((item) => item.options.map((option) => [option.legacyOptionId, option.id] as const)),
);

/** Unknown and already-migrated IDs are preserved, so unrelated history remains intact. */
export function migrateItemId(oldId: string): string {
  return itemAliases.get(oldId) ?? oldId;
}

export function migrateOptionId(oldId: string): string {
  return optionAliases.get(oldId) ?? oldId;
}
