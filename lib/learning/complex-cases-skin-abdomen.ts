import type { EvolvingQuestion } from './evolving-types'

/**
 * Original fictional teaching material; clinical review is pending.
 * Additional findings are explicitly introduced as simulated evidence in prompts.
 * Questions test nursing assessment, escalation and collaboration, not independent
 * diagnosis, prescribing or an instruction to follow a particular treatment.
 * Reference checks (22 October 2026):
 * https://www.nice.org.uk/guidance/ng141/chapter/Recommendations
 *   Reassessment must consider symptoms, response and alternative diagnoses.
 * https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/
 *   Deeper disease may have limited surface changes; clinical concern matters.
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC7386163/
 *   WSES: individualized appendicitis assessment; persistent/progressive symptoms
 *   require reassessment despite initially reassuring investigations.
 * https://doi.org/10.1001/jamasurg.2025.6218
 *   Current 2025 WSES update (published January 2026), abstract checked: risk
 *   assessment and imaging contribute to diagnosis; care is individualized.
 * https://www.nice.org.uk/guidance/CG50/chapter/recommendations
 *   Physiological change or clinical concern can trigger a local graded response.
 */
type Choice = [text: string, explanation: string]
type LevelQuestions = {
  challenge: EvolvingQuestion
  advanced: EvolvingQuestion
}

function q(
  prompt: string,
  options: Choice[],
  correct: number[],
  reflection: string
): EvolvingQuestion {
  return {
    prompt,
    options: options.map(([text, explanation], index) => ({
      id: String(index),
      text,
      explanation,
    })),
    correct: correct.map(String),
    reflection,
  }
}

export const complexSkinAbdomen: Record<
  string,
  Record<string, LevelQuestions[]>
> = {
  'skin-systemic': {
    a: [
      {
        challenge: q(
          'Dara’s pain and swelling have increased, but the marked skin border has changed little. Which reassessment would best determine whether the condition is worsening beyond the visible skin?',
          [
            [
              'Measure border width and repeat the photograph in the same lighting.',
              'Standardized photographs support comparison but do not establish pain, limb function or systemic condition.',
            ],
            [
              'Compare pain, weight-bearing, swelling and systemic findings against the earlier record.',
              'This checks the discrepancy between a relatively stable surface and worsening symptoms using local, functional and systemic evidence.',
            ],
            [
              'Check the time of the first antibiotic and use that interval as the main measure of response.',
              'Treatment timing is relevant, but elapsed time alone cannot explain or grade the current deterioration.',
            ],
            [
              'Prioritize the presence of warmth because it separates infection from noninfectious swelling.',
              'Warmth can occur in several inflammatory processes and does not reliably discriminate the cause by itself.',
            ],
          ],
          [1],
          'Which change in limb function would make a stable photograph less reassuring?'
        ),
        advanced: q(
          'Additional simulated assessment: Dara reports new deep calf pain extending beyond the marked redness; distal pulses are palpable. Select TWO conclusions that should shape the differential before the next review.',
          [
            [
              'Palpable distal pulses make a deep soft-tissue process sufficiently unlikely to set aside.',
              'Pulses assess one aspect of circulation; their presence does not exclude a deep tissue infection or other important cause of pain.',
            ],
            [
              'Tenderness beyond the visible border supports assessment of tissue involvement beyond the surface.',
              'The distribution of symptoms and visible inflammation are discordant, so deeper involvement needs consideration.',
            ],
            [
              'Unilateral pain and swelling also warrant a thrombosis risk history and focused assessment.',
              'DVT can resemble a skin infection; the original label does not remove that alternative.',
            ],
            [
              'Pain beyond the border establishes that the prescribed antibiotic is the wrong drug.',
              'That finding raises concern about the process and its extent, but does not establish the organism, susceptibility or drug choice.',
            ],
          ],
          [1, 2],
          'What evidence would distinguish a venous process from deeper infection without delaying review of either?'
        ),
      },
      {
        challenge: q(
          'Dara now has severe pain that is disproportionate to the small visible skin change. Which question to the reviewing clinician best addresses the new risk?',
          [
            [
              'Could this be deeper tissue involvement needing urgent bedside assessment?',
              'The pain-to-appearance mismatch changes urgency and requires consideration of a serious deeper process without declaring the diagnosis.',
            ],
            [
              'Would a repeat photograph help decide whether today’s analgesia is working?',
              'A photograph cannot assess the severe symptom or safely resolve concern about deeper involvement.',
            ],
            [
              'Should the skin border be redrawn before deciding the timing of review?',
              'Marking spread can help monitoring, but it should not become a prerequisite for reviewing disproportionate pain.',
            ],
            [
              'Could we reassess once the next antibiotic administration is complete?',
              'A dosing milestone is not a suitable substitute for assessment of a newly concerning clinical pattern.',
            ],
          ],
          [0],
          'Describe the mismatch that makes this more than a routine pain-management question.'
        ),
        advanced: q(
          'Additional simulated assessment: Dara’s lower leg feels increasingly tense and passive ankle movement sharply increases pain. Sensation and pulses remain present. Which interpretation best integrates these findings?',
          [
            [
              'Preserved sensation supports treating the pain mainly as inflammatory until a neurologic deficit appears.',
              'A late neurologic deficit is not required before escalating concern about a pressure-related or deep tissue process.',
            ],
            [
              'Pain on movement distinguishes a compartment process from infection and establishes the cause.',
              'This increases concern but is not sufficiently specific to establish one diagnosis or exclude another.',
            ],
            [
              'The pulse finding makes vascular or pressure-related concerns lower priority than border monitoring.',
              'A distal pulse does not remove concern about tissue-level perfusion or pressure.',
            ],
            [
              'Urgent review must consider pressure-related injury and deep infection despite pulses.',
              'Tense swelling, severe pain and painful passive movement require prompt clinician assessment while the differential remains open.',
            ],
          ],
          [3],
          'What must you communicate immediately, and which finding must you avoid presenting as a rule-out test?'
        ),
      },
      {
        challenge: q(
          'Dara’s observations have moved from HR 98, BP 126/76 and RR 20 to HR 116, BP 104/66 and RR 26. The leg border is similar. Which problem should lead the next clinical review?',
          [
            [
              'Whether the remaining erythema needs a different topical dressing.',
              'Local skin care does not address the new circulatory and respiratory trend.',
            ],
            [
              'Whether pain is raising the pulse, followed by an assessment only of analgesic effect.',
              'Pain may contribute, but this explanation does not account safely for the whole trend without broader assessment.',
            ],
            [
              'Possible systemic deterioration affecting perfusion, cognition or breathing.',
              'Several observation domains have changed together, so systemic assessment takes priority over appearance alone.',
            ],
            [
              'Whether the measured temperature has changed enough to classify the infection as more severe.',
              'Temperature is one contributor; the changing pressure, pulse and respiratory rate already justify concern.',
            ],
          ],
          [2],
          'Which additional finding would help establish the current effect on perfusion?'
        ),
        advanced: q(
          'Dara’s pulse is rising while pressure falls and breathing accelerates. Select THREE observations that would most directly strengthen the next assessment of systemic impact, rather than simply restate the skin diagnosis.',
          [
            [
              'A new change in orientation or attention compared with Dara’s usual state.',
              'A new cognitive change helps assess possible systemic effect and may change escalation urgency.',
            ],
            [
              'The urine volume over a defined recent interval, compared with intake and prior output.',
              'A time-linked output trend contributes to perfusion assessment; it is not a stand-alone diagnosis.',
            ],
            [
              'A repeat limb-circumference measurement to quantify whether local swelling is increasing.',
              'This can quantify local edema, but it is less direct than cognition, timed output and perfusion findings for the systemic impact asked about here.',
            ],
            [
              'Current capillary refill, skin perfusion and the reliability of the repeat pressure measurement.',
              'These observations help interpret the circulatory trend and verify that the data are usable.',
            ],
          ],
          [0, 1, 3],
          'How would you combine these findings without treating any single measure as proof of sepsis?'
        ),
      },
      {
        challenge: q(
          'Dara is being assessed for both infection and a noninfectious cause of unilateral swelling. Which addition to the handover would best help the team distinguish those possibilities?',
          [
            [
              'The cellulitis label and the most recent skin photograph.',
              'These give context but leave out the history and changing examination needed to evaluate alternatives.',
            ],
            [
              'Onset, injury/immobility, tenderness distribution and treatment response.',
              'These data help compare competing explanations rather than assuming that the initial label is established.',
            ],
            [
              'The antibiotic name and whether each scheduled administration was documented.',
              'Administration history matters, but it is not a substitute for the broader discriminating history and assessment.',
            ],
            [
              'The current temperature and the patient’s estimate of how red the leg looks.',
              'These describe only part of the picture and miss the worsening pain and systemic trajectory.',
            ],
          ],
          [1],
          'Which part of the new assessment would make you question the original working diagnosis?'
        ),
        advanced: q(
          'Additional simulated team discussion: venous ultrasound is being arranged for Dara, but severe pain and systemic deterioration remain unexplained. Which plan best manages the competing diagnostic pathways?',
          [
            [
              'Urgent tissue/limb review should proceed alongside the venous investigation.',
              'Evaluating DVT and reviewing a potentially serious tissue process can occur in parallel; a pending test should not suspend response to current deterioration.',
            ],
            [
              'Use the ultrasound result to decide whether a further limb examination is needed.',
              'Venous imaging answers a particular question; it cannot replace a current assessment of severe pain and tissue findings.',
            ],
            [
              'Ask the imaging team to prioritize the scan and keep the current review plan unchanged.',
              'Imaging prioritization alone does not address whether the current bedside urgency has increased.',
            ],
            [
              'Present the problem as antibiotic failure so infection remains the lead diagnostic pathway.',
              'A coherent differential should retain both infectious and noninfectious causes until the evidence distinguishes them.',
            ],
          ],
          [0],
          'What clinical question can ultrasound answer, and what important question will it leave unresolved?'
        ),
      },
      {
        challenge: q(
          'Dara’s relative reports new confusion. Temperature has fallen to 38.3°C, but HR is 118, BP 100/64 and RR 27. Which opening statement best communicates the reason for urgent reassessment?',
          [
            [
              'Dara’s cellulitis has not cleared, although the temperature is improving.',
              'This emphasizes the label and one improved value rather than the new cognitive and physiological concerns.',
            ],
            [
              'Dara may need a different antibiotic because the leg still looks inflamed.',
              'This jumps to a treatment explanation that has not been established.',
            ],
            [
              'Dara is newly confused compared with the relative-confirmed baseline, with persistent tachycardia, lower pressure and fast breathing; please reassess now.',
              'The statement identifies the new functional change, supporting trend and concrete request without claiming a mechanism.',
            ],
            [
              'Dara’s family is concerned and would like someone to explain the plan.',
              'The family concern matters, but this wording does not convey the objective clinical change requiring review.',
            ],
          ],
          [2],
          'Which finding makes this update different from a routine request for an explanation?'
        ),
        advanced: q(
          'Additional simulated response: a clinician asks you to recheck Dara because the fever is lower. Which TWO actions make the escalation both clinically specific and closed-loop?',
          [
            [
              'Repeat current observations and a focused cognitive/perfusion assessment, reporting the findings promptly.',
              'Verification and immediate reassessment add useful evidence without treating the earlier concern as resolved.',
            ],
            [
              'Agree who will review Dara, how soon, and which further change triggers the local urgent-response pathway.',
              'A named response and contingency plan reduce ambiguity about responsibility and timing.',
            ],
            [
              'Send the skin photograph again and assume the review request has been accepted.',
              'An image neither communicates the full systemic concern nor confirms that someone has accepted the review.',
            ],
            [
              'Describe the lower temperature as evidence that the confusion probably has a noninfectious cause.',
              'The temperature does not establish the cause of confusion; both infection and alternatives still need assessment.',
            ],
          ],
          [0, 1],
          'What would you do if the agreed response did not occur while the confusion persisted?'
        ),
      },
      {
        challenge: q(
          'After team care, Dara’s HR is 108, BP 110/70 and RR 23. Residual redness remains. Which finding would most strongly argue that recovery is still incomplete?',
          [
            [
              'The marked area remains pink despite a smaller swelling measurement.',
              'Residual color can resolve slowly; it must be interpreted with the clinical trajectory.',
            ],
            [
              'Dara can describe the follow-up plan accurately.',
              'Understanding is useful, but it is not itself evidence of physiological or functional recovery.',
            ],
            [
              'Dara says the pain is lower after prescribed analgesia.',
              'This is one improvement but does not determine whether deeper pain or functional problems remain.',
            ],
            [
              'Deep pain remains severe and Dara cannot bear weight as previously able.',
              'Persistent severe pain and impaired function require review even when some systemic measurements improve.',
            ],
          ],
          [3],
          'Which recovery outcome matters beyond a better temperature or a smaller border?'
        ),
        advanced: q(
          'Additional simulated reassessment: Dara is alert, swelling is decreasing and assisted walking is easier, but the skin remains red. Select TWO findings or plans that best support a safe continuing-care discussion with the treating team.',
          [
            [
              'Base the next care step mainly on whether the marked redness has stopped expanding.',
              'Border stability is useful, but it cannot replace assessment of systemic recovery, deep pain and function.',
            ],
            [
              'Document the pain/function and systemic trends together, including the remaining limitations.',
              'This distinguishes partial clinical recovery from residual findings and makes unresolved concerns visible.',
            ],
            [
              'Treat an improved walking distance as proof that a deep complication was never present.',
              'A response does not retrospectively establish or exclude the original mechanism.',
            ],
            [
              'Use teach-back for renewed deep pain, spreading symptoms or systemic change, with a specific contact and review plan.',
              'Safety-netting must be actionable and linked to the concerning features of this episode.',
            ],
          ],
          [1, 3],
          'What would you need the treating team to clarify before calling Dara ready for discharge?'
        ),
      },
    ],
    b: [
      {
        challenge: q(
          'Alex takes immunosuppressive treatment and reports deep leg pain with subtle surface redness. At this first review, which information would most change the interpretation of the skin findings?',
          [
            [
              'Whether the redness is as extensive as a typical photograph of cellulitis.',
              'Visual pattern matching can miss clinically significant disease and does not establish the current risk.',
            ],
            [
              'The exact autoimmune diagnosis, considered separately from the new symptom timeline.',
              'The underlying diagnosis matters, but separating it from the current trajectory limits its usefulness.',
            ],
            [
              'New pain/function and systemic trends in the context of the medicine history.',
              'Immunosuppression and the pain-to-appearance mismatch make a combined assessment more informative than surface appearance.',
            ],
            [
              'Whether the measured temperature is above the usual fever threshold.',
              'A modest temperature does not resolve risk in an immunosuppressed person with new symptoms.',
            ],
          ],
          [2],
          'How does the medicine history change what a subtle surface examination can tell you?'
        ),
        advanced: q(
          'Additional simulated history: Alex describes pain that is new and unlike previous autoimmune flares; the medication list has not yet been reconciled. Which TWO information gaps most directly affect today’s risk assessment?',
          [
            [
              'Exact immunosuppressive agents, recent changes and the timing of the last administration.',
              'The actual treatment context helps assess risk and supports an informed medication review.',
            ],
            [
              'A prior photograph showing a similar degree of redness during an unrelated episode.',
              'An old photograph may add context but cannot establish the cause or severity of this new deep pain.',
            ],
            [
              'A precise timeline of new pain, tenderness distribution and loss of limb function.',
              'These discriminate the present episode from a familiar label and identify progression beyond visible skin.',
            ],
            [
              'Whether Alex’s autoimmune condition has ever caused fatigue.',
              'Nonspecific remote fatigue does not resolve the current new limb symptoms or their urgency.',
            ],
          ],
          [0, 2],
          'Which familiar explanation could create anchoring here, and what new evidence challenges it?'
        ),
      },
      {
        challenge: q(
          'Alex’s deep pain has intensified and extends beyond the subtle surface change. Which working interpretation should guide your request for reassessment?',
          [
            [
              'A usual autoimmune flare is most likely because fever remains modest.',
              'The new pattern has not been explained; a modest temperature cannot establish an autoimmune cause.',
            ],
            [
              'Possible deeper disease needs review alongside infectious and noninfectious causes.',
              'This recognizes increased urgency while avoiding premature diagnostic certainty.',
            ],
            [
              'Immunosuppression makes the visual border a more reliable marker than reported pain.',
              'Immunosuppression does not make surface appearance a sufficient measure of tissue involvement.',
            ],
            [
              'A larger analgesic response would distinguish inflammation from infection.',
              'Relief after analgesia is not a reliable diagnostic discriminator between these processes.',
            ],
          ],
          [1],
          'What assessment could help distinguish ordinary tenderness from a developing limb complication?'
        ),
        advanced: q(
          'Additional simulated examination: Alex has tenderness extending beyond erythema, no visible blistering and no palpable crepitus. Which inference is most defensible?',
          [
            [
              'The absent skin features reduce concern enough to use the next border check as the decision point.',
              'Absence of these surface features does not reliably exclude an early deeper tissue process.',
            ],
            [
              'The tenderness distribution establishes necrotizing infection rather than a vascular alternative.',
              'The finding is concerning but cannot by itself confirm one diagnosis or remove competing causes.',
            ],
            [
              'The medicine history means the physical examination cannot contribute useful evidence.',
              'The examination remains essential, although its findings must be interpreted with risk and trajectory.',
            ],
            [
              'Absent surface signs leave uncertainty; progressive deep pain still needs urgent review.',
              'A concerning symptom trajectory is not neutralized by absent late or variable external features.',
            ],
          ],
          [3],
          'Which absent finding might be overvalued, and what positive finding should keep your concern active?'
        ),
      },
      {
        challenge: q(
          'Alex’s temperature is 37.8°C, with HR 114, BP 102/64 and RR 26, compared with 96, 120/74 and 20 initially. Which issue should be prioritized over deciding whether this is an autoimmune flare?',
          [
            [
              'Systemic deterioration needs prompt review while the cause remains uncertain.',
              'The physiological trend requires a response now; distinguishing the cause can proceed during assessment.',
            ],
            [
              'Whether the temperature will reach a higher fever threshold on the next observation set.',
              'Waiting for a more striking temperature would give too little weight to the existing deterioration.',
            ],
            [
              'Whether the leg looks more like a previous flare on the next photograph.',
              'Visual similarity cannot resolve the current systemic change.',
            ],
            [
              'Whether a scheduled immunosuppressant is due before the next routine medication round.',
              'Medication reconciliation matters, but it does not outrank assessing the current deterioration.',
            ],
          ],
          [0],
          'What can be assessed immediately without first agreeing on a definitive diagnosis?'
        ),
        advanced: q(
          'Additional simulated result: Alex’s total white-cell count is reported within the laboratory interval. Select TWO interpretations that best integrate this result with immunosuppression, worsening leg pain and the observation trend.',
          [
            [
              'The result shifts the explanation toward autoimmune disease strongly enough to defer infection assessment.',
              'A single result cannot safely outweigh the changing clinical condition or establish an autoimmune cause.',
            ],
            [
              'The test does not exclude a serious infection; the clinical trend still requires urgent assessment.',
              'A result within an interval has limitations and must be interpreted with the current presentation.',
            ],
            [
              'The exact immunosuppressive regimen and any previous counts may help the team interpret this result.',
              'Treatment context and prior results improve interpretation without converting one test into a rule-out.',
            ],
            [
              'The result establishes that any systemic change must be caused by the medication itself.',
              'Medication effects remain among possible contributors, but this result does not prove that mechanism.',
            ],
          ],
          [1, 2],
          'How would you explain the limitation of this reassuring result without claiming that it is useless?'
        ),
      },
      {
        challenge: q(
          'Alex’s team is reassessing serious infection and alternative causes of swelling. Which collaborative request is most useful now?',
          [
            [
              'Ask wound care to choose a dressing before the wider clinical assessment.',
              'Local wound management may contribute later but cannot substitute for evaluation of systemic deterioration and deep pain.',
            ],
            [
              'Ask the clinician to classify the episode as an autoimmune flare before reconciling medicines.',
              'This would close the differential before important clinical and medication information is reviewed.',
            ],
            [
              'Coordinate bedside and medication review using the symptom/treatment timeline.',
              'This connects the unresolved problem to the relevant assessment and medication context.',
            ],
            [
              'Ask pharmacy to determine whether the leg diagnosis is infectious from the medication list alone.',
              'Pharmacy contributes medication expertise; the diagnosis also requires current examination and broader clinical assessment.',
            ],
          ],
          [2],
          'Which question belongs to the prescribing clinician, and which can pharmacy help clarify?'
        ),
        advanced: q(
          'Additional simulated planning: Alex’s next immunosuppressive treatment is due later today; the team has not documented whether to continue it during this acute illness. Select TWO actions that best address the immediate planning gap.',
          [
            [
              'Confirm the exact medicine, indication, recent administration and monitoring information with pharmacy or the medication record.',
              'Accurate reconciliation allows the prescriber to assess the actual treatment rather than a broad drug category.',
            ],
            [
              'Use the possibility of infection as sufficient reason to omit the next treatment before obtaining a prescribing review.',
              'A possible infection warrants timely review, but the exact agent, indication and competing risks still require an individualized prescribing decision.',
            ],
            [
              'Use the risk of an autoimmune flare as the deciding reason to keep the current schedule pending review.',
              'Flare risk matters, but it should be weighed with the acute illness and actual medicine by the responsible prescriber.',
            ],
            [
              'Ask the responsible prescriber to document a patient-specific decision and review point, while the urgent clinical assessment proceeds.',
              'This closes the medication-planning gap without delaying review or making an independent treatment decision.',
            ],
          ],
          [0, 3],
          'What risks could follow from either an automatic omission or an automatic continuation?'
        ),
      },
      {
        challenge: q(
          'Alex’s family identifies new confusion while skin color appears unchanged. HR is 116, BP 100/62 and RR 27. Which statement best supports an urgent response?',
          [
            [
              'The family is concerned because the skin infection has not visibly improved.',
              'This does not convey the new neurologic change or the systemic trend.',
            ],
            [
              'Alex is newly confused compared with the family-confirmed baseline, with persistent systemic deterioration despite little skin or temperature change.',
              'This explains why apparently reassuring local findings do not settle the current risk.',
            ],
            [
              'The immunosuppressant has caused delirium and should be stopped at the next round.',
              'The mechanism is unconfirmed and the proposed medication change requires appropriate assessment and prescribing review.',
            ],
            [
              'The skin is unchanged, so the main request is a separate routine cognitive assessment.',
              'Separating the cognitive change from the systemic illness can understate its current significance.',
            ],
          ],
          [1],
          'What baseline information from the family should be included without substituting for your own assessment?'
        ),
        advanced: q(
          'Additional simulated bedside check: Alex is inattentive; the point-of-care glucose is within the local interval and oxygen saturation remains 95%. Which next interpretation best avoids premature closure?',
          [
            [
              'The two reassuring measurements make an acute physiological cause of confusion unlikely.',
              'These checks address specific contributors but do not exclude other acute causes of delirium or systemic illness.',
            ],
            [
              'The confusion confirms sepsis-related brain dysfunction and resolves the differential.',
              'The presentation raises concern but does not establish one cause of the cognitive change.',
            ],
            [
              'A medication explanation now outranks all other causes because glucose and saturation are reassuring.',
              'Medication effects are one possibility; these measurements do not establish that priority.',
            ],
            [
              'Report unexplained confusion urgently with the systemic and medication context.',
              'The assessment must integrate the whole pattern while investigating reversible and competing causes.',
            ],
          ],
          [3],
          'Which causes have these checks made less likely, and which important possibilities remain open?'
        ),
      },
      {
        challenge: q(
          'Alex’s observations improve to HR 106, BP 112/70 and RR 23, but deep pain and mobility remain under review. What would best establish whether the continuing-care plan is working?',
          [
            [
              'Reassess pain, function and systemic recovery; report unresolved findings.',
              'Improvement must include the concerns that prompted escalation, rather than only the values that improved first.',
            ],
            [
              'A comparison of today’s redness with a typical uncomplicated skin infection.',
              'A typical image does not provide Alex’s baseline or assess deep pain and function.',
            ],
            [
              'A record that all prescribed medicines were administered on time.',
              'Process completion matters but does not establish the clinical or functional outcome.',
            ],
            [
              'A temperature remaining below the usual fever threshold.',
              'That was never sufficient to characterize the risk in this episode and remains an incomplete outcome.',
            ],
          ],
          [0],
          'Which unresolved concern would make you question a routine discharge trajectory?'
        ),
        advanced: q(
          'Additional simulated discharge discussion: Alex can walk with less pain but cannot explain which team will review the immunosuppressant or whom to contact if deep pain returns without fever. Which TWO gaps need resolution with the treating team?',
          [
            [
              'Require all residual redness to resolve before any continuing-care plan can be considered.',
              'The color trajectory must be interpreted clinically; it is not the only readiness criterion.',
            ],
            [
              'Clarify the individualized medicine decision, responsible prescriber and planned review.',
              'Alex needs an explicit, coordinated medication plan rather than an assumption about restarting or continuing treatment.',
            ],
            [
              'Confirm a contact route and return criteria that include recurrent severe pain or systemic change even without fever.',
              'This safety net addresses the way this episode presented and the person’s ability to obtain help.',
            ],
            [
              'Advise Alex to rely on fever as the clearest sign of a recurrent problem.',
              'That would repeat the misleading reassurance already encountered in this case.',
            ],
          ],
          [1, 2],
          'How would teach-back show that Alex can use the plan at home rather than merely repeat its wording?'
        ),
      },
    ],
  },
  'abdomen-turn': {
    a: [
      {
        challenge: q(
          'Nico’s abdominal pain persists and appetite is reduced after an inconclusive initial assessment. Which follow-up history would most help distinguish an evolving abdominal process from a stable, self-limited episode?',
          [
            [
              'Whether Nico would describe the pain as severe enough to need hospital care.',
              'The person’s experience matters, but this broad judgment does not characterize the evolving pattern.',
            ],
            [
              'Pain migration, movement effects and the timing of GI or urinary symptoms.',
              'A time-linked pattern and associated symptoms provide evidence for reassessing the differential.',
            ],
            [
              'Whether the first examiner was confident in the original assessment.',
              'Confidence in an earlier assessment does not establish the present condition.',
            ],
            [
              'Whether a previous stomach illness felt equally painful.',
              'A past comparison may add context but cannot explain the current episode on its own.',
            ],
          ],
          [1],
          'Which new history detail would most change the need for another focused examination?'
        ),
        advanced: q(
          'Additional simulated history: Nico describes pain starting centrally and moving toward the right lower abdomen, with nausea and reduced appetite but no diarrhea. Which TWO conclusions best calibrate the differential?',
          [
            [
              'The evolving location raises concern for appendicitis and should inform the repeat examination and diagnostic discussion.',
              'The trajectory supports this possibility but must be combined with examination and other clinical information.',
            ],
            [
              'The absence of diarrhea is sufficient to remove gastroenteritis and all other benign causes.',
              'A missing symptom can alter probability without reliably excluding an entire category of causes.',
            ],
            [
              'The migration establishes appendicitis, so urinary and other abdominal causes need no further assessment.',
              'A suggestive pattern is not a confirmed diagnosis and does not remove the need to assess alternatives.',
            ],
            [
              'Associated urinary symptoms, bowel function and examination findings are still needed to evaluate competing causes.',
              'Maintaining an evidence-based differential prevents premature closure around a classic pattern.',
            ],
          ],
          [0, 3],
          'What would make appendicitis more likely, and what finding would pull your differential in another direction?'
        ),
      },
      {
        challenge: q(
          'Nico’s pain has changed location and walking is more uncomfortable. HR has risen from 90 to 100, with RR from 18 to 21. What is the strongest reason to revisit the earlier assessment?',
          [
            [
              'Any change in pain location confirms that a surgical diagnosis was missed.',
              'Migration is useful evidence but does not prove a diagnosis or establish an error in the earlier assessment.',
            ],
            [
              'The new pulse alone now exceeds a threshold that determines the cause.',
              'One measurement cannot establish the cause; the trajectory and functional change matter together.',
            ],
            [
              'New pain, function and systemic findings show a changed clinical state.',
              'A changing state may reduce confidence in an earlier explanation even before a single dramatic sign appears.',
            ],
            [
              'Walking difficulty makes the reported numeric pain rating less trustworthy.',
              'Observed function adds information; it does not invalidate the person’s pain report.',
            ],
          ],
          [2],
          'How would you document the new findings so the earlier assessment is useful context rather than a reason to close the case?'
        ),
        advanced: q(
          'Additional simulated examination: Nico now has focal right-lower-quadrant tenderness and pain with coughing. The first examination was diffuse. Which interpretation best guides the next team discussion?',
          [
            [
              'New focal and movement-related pain raises concern for a peritoneal/inflammatory process.',
              'These changes alter the working probability and urgency, although they do not independently establish the cause.',
            ],
            [
              'The findings can be explained by abdominal muscle strain because they change with coughing.',
              'Movement-related pain is not specific to muscle strain and must be interpreted with the whole evolving abdominal picture.',
            ],
            [
              'A focal examination means earlier normal observations are no longer useful to communicate.',
              'The earlier state provides the baseline needed to demonstrate the trajectory.',
            ],
            [
              'The new location determines the operation required, even before further clinician assessment.',
              'An examination pattern does not by itself determine diagnosis, treatment or procedural suitability.',
            ],
          ],
          [0],
          'What would you ask the clinician to clarify about the next diagnostic step and reassessment interval?'
        ),
      },
      {
        challenge: q(
          'Nico says the pain briefly eased, but now looks more unwell. BP has fallen to 110/68 and RR risen to 24, compared with 126/78 and 18 initially. Which immediate assessment priority best addresses the discrepancy?',
          [
            [
              'Repeat the pain score after allowing more time for analgesia.',
              'The analgesic response is relevant, but it does not address the worsening appearance and systemic trend.',
            ],
            [
              'Ask whether the pain has returned to its original location.',
              'Location remains useful, but a location-only assessment misses current physiological deterioration.',
            ],
            [
              'Check whether Nico can eat a small meal as a test of improvement.',
              'An oral intake trial is not an appropriate stand-alone way to resolve this deterioration and requires the current care plan to be clarified.',
            ],
            [
              'Reassess and report the abdominal and systemic deterioration.',
              'The new systemic findings take priority over interpreting pain relief as recovery.',
            ],
          ],
          [3],
          'Which observation would make the brief reduction in pain less reassuring?'
        ),
        advanced: q(
          'Additional simulated report: Nico’s pain fell before any new analgesic, then became more diffuse while movement grew difficult. Select TWO statements that best express the concern without claiming an unconfirmed complication.',
          [
            [
              'This sequence proves that the appendix has perforated.',
              'That complication is possible, but the sequence alone does not establish anatomy or cause.',
            ],
            [
              'The pain trajectory and systemic change raise concern for a developing intra-abdominal complication needing urgent review.',
              'The combination warrants action while diagnostic uncertainty remains explicit.',
            ],
            [
              'A transient reduction in reported pain does not outweigh worsening function, pressure and respiratory rate.',
              'Discordant outcomes should be integrated rather than allowing one apparently improved symptom to dominate.',
            ],
            [
              'The temporary relief makes an inflammatory abdominal process substantially less plausible.',
              'Transient relief does not reliably exclude an evolving inflammatory or peritoneal process.',
            ],
          ],
          [1, 2],
          'How can you communicate a time-sensitive concern without telling Nico a complication is confirmed?'
        ),
      },
      {
        challenge: q(
          'Nico asks, “Does this mean I have to have surgery?” Further assessment is being arranged while BP is 100/64 and RR 27. Which response best supports understanding and the current clinical priority?',
          [
            [
              '“The changing pain and observations need urgent review. The cause and whether a procedure is needed are still being assessed; what worries you most?”',
              'This explains the reason for the urgent assessment, preserves uncertainty and invites the person’s priorities.',
            ],
            [
              '“The next scan will tell us exactly what will happen, so we can discuss options afterward.”',
              'A scan may not resolve every uncertainty, and questions and preferences should not automatically be deferred.',
            ],
            [
              '“Because you are young, observation is usually enough before deciding about surgery.”',
              'Age alone cannot determine the appropriate trajectory in a person whose condition is changing.',
            ],
            [
              '“The pain has changed, so preparing for surgery is the only reasonable option.”',
              'This presents a treatment conclusion before the clinical assessment and individualized discussion are complete.',
            ],
          ],
          [0],
          'What can you explain now, and what decision belongs to the assessing team and Nico together?'
        ),
        advanced: q(
          'Additional simulated planning: Nico is worried analgesia will hide the diagnosis; a fasting instruction is present without a documented review point. Which TWO clarifications would support a coherent plan during urgent reassessment?',
          [
            [
              'Ask Nico to avoid requesting pain relief so the next examiner can observe the untreated symptoms.',
              'Pain should not be deliberately left untreated merely to preserve a diagnostic display; assessment and a prescribed analgesia plan can be coordinated.',
            ],
            [
              'Explain the prescribed analgesia plan and agree repeat assessment of pain, function and systemic observations after it.',
              'Comfort and ongoing diagnostic assessment can proceed together, using multiple outcomes rather than pain score alone.',
            ],
            [
              'Use the next pain score to decide independently whether fasting can end.',
              'A single symptom score does not determine the diagnostic or procedural plan.',
            ],
            [
              'Clarify with the treating team the current reason for fasting and when that instruction will be reviewed.',
              'A restriction should fit the present investigation and procedural plan rather than continue without an explicit reason or review.',
            ],
          ],
          [1, 3],
          'How would the plan avoid both unnecessary suffering and a missed change in the abdominal assessment?'
        ),
      },
      {
        challenge: q(
          'The receiving team has Nico’s initial results but has not heard the new trend: HR 112, BP 104/66 and RR 26, with worsening movement tolerance. Which handover opening best explains why the earlier plan needs review?',
          [
            [
              'Nico’s initial results are available, and another pain score is due.',
              'This omits the change that now drives the need for reassessment.',
            ],
            [
              'Nico probably has appendicitis, and the pain has not fully resolved.',
              'This leads with an unconfirmed diagnosis and undercommunicates the physiological and functional trend.',
            ],
            [
              'Nico has changed since the initial assessment: pressure is lower, pulse and breathing are faster, and movement is more difficult; I am requesting prompt reassessment.',
              'The change, supporting evidence and requested response are clear without requiring a definitive label.',
            ],
            [
              'Nico is anxious about possible surgery and would like to know the investigation plan.',
              'The concern deserves attention, but it does not communicate the urgent clinical reason for the handover.',
            ],
          ],
          [2],
          'Which earlier values provide the most useful comparison in this update?'
        ),
        advanced: q(
          'Additional simulated result: Nico’s ultrasound report says the appendix was not visualized. Symptoms and observations remain concerning. What should you communicate about this result?',
          [
            [
              'A nondiagnostic report leaves uncertainty; agree further assessment with the clinician.',
              'Not seeing the appendix does not by itself exclude appendicitis; the result must be integrated with the current trajectory.',
            ],
            [
              'The ultrasound is negative, so the current pain is more likely a functional disorder.',
              'A nondiagnostic report does not establish a benign alternative or resolve the changing condition.',
            ],
            [
              'The ultrasound confirms that a different abdominal organ is responsible.',
              'The report described does not identify another cause.',
            ],
            [
              'The report should be omitted from the handover because it did not show an abnormality.',
              'A nondiagnostic test and its limitations remain relevant to the next decision.',
            ],
          ],
          [0],
          'What is the difference between a negative test for a finding and a test that did not assess it conclusively?'
        ),
      },
      {
        challenge: q(
          'After team care, Nico reports better pain control and observations improve to HR 104, BP 114/70 and RR 22. Which additional outcome most helps evaluate readiness for the next care step?',
          [
            [
              'Whether the pain score is lower than the highest recorded value.',
              'That improvement is already known and does not address the remaining functional and care-planning questions.',
            ],
            [
              'Whether function, intake and reassessment arrangements fit the care plan.',
              'Clinical recovery, function and a usable plan all matter; a better pain score alone is insufficient.',
            ],
            [
              'Whether the initial examination can now be described as reassuring.',
              'The current recovery does not retrospectively determine what the earlier assessment established.',
            ],
            [
              'Whether Nico can state a preferred discharge time.',
              'Preferences should inform planning, but readiness requires the clinical and practical assessment as well.',
            ],
          ],
          [1],
          'Which unresolved concern should remain visible when the pain has improved?'
        ),
        advanced: q(
          'Additional simulated continuing-care discussion: the cause of Nico’s pain remains unconfirmed. Select THREE elements needed to evaluate an observation or discharge plan with the treating team.',
          [
            [
              'The current abdominal examination and systemic trend, including any persistent focal or movement-related findings.',
              'Unresolved examination findings and physiological recovery are central to the clinical decision.',
            ],
            [
              'Using a pain score below the initial value as the main criterion for leaving the observation pathway.',
              'A lower pain score is useful but cannot outweigh unresolved examination, physiological or functional concerns.',
            ],
            [
              'The ability to manage the agreed intake/activity plan and obtain reassessment if symptoms change.',
              'A plan must be feasible for this person rather than based only on improved numbers.',
            ],
            [
              'Specific return triggers, where to seek help and the timing and ownership of follow-up.',
              'Diagnostic uncertainty requires an actionable safety net and clear responsibility.',
            ],
          ],
          [0, 2, 3],
          'What would make home observation unsafe even if Nico prefers to leave and the pain is lower?'
        ),
      },
    ],
    b: [
      {
        challenge: q(
          'Emery, 67, has diffuse discomfort and reduced appetite; family reports less activity than usual. The earlier assessment was reassuring. Which new cue most directly challenges confidence in that earlier state?',
          [
            [
              'The absence of a classic right-lower-quadrant pain description.',
              'Absence of a classic pattern does not establish that the current abdominal process is benign.',
            ],
            [
              'The fact that discomfort is described as diffuse rather than severe.',
              'Neither a diffuse location nor a less dramatic descriptor is a reliable reassurance in isolation.',
            ],
            [
              'Emery’s age without reference to the current symptoms.',
              'Age informs risk and presentation but does not diagnose the present episode.',
            ],
            [
              'A new decline in usual activity while the symptoms persist.',
              'A functional change provides evidence that the clinical state may have evolved beyond the earlier reassuring review.',
            ],
          ],
          [3],
          'What would you ask the family to describe concretely rather than simply saying Emery is “not themselves”?'
        ),
        advanced: q(
          'Additional simulated history: Emery has eaten little, is walking less and has not yet been asked about vomiting, bowel function or urinary symptoms. Which TWO next steps best refine the differential without waiting for classic localized pain?',
          [
            [
              'Obtain a time-linked GI and urinary history, medication history and prior abdominal procedures with the current examination.',
              'These data help compare inflammatory, obstructive, urinary and other possible causes of diffuse symptoms.',
            ],
            [
              'Use the nonlocalized pain to lower the priority of any abdominal cause requiring intervention.',
              'Atypical or diffuse presentations can still reflect serious abdominal disease.',
            ],
            [
              'Verify the baseline functional change and repeat systemic observations while the clinician reviews the evolving picture.',
              'Functional and physiological change can justify reassessment even when localization remains unclear.',
            ],
            [
              'Use the previous reassuring assessment as evidence that the current symptoms are a continuation of the same low-risk state.',
              'That conclusion requires a current comparison rather than assuming that an earlier state persists.',
            ],
          ],
          [0, 2],
          'What information would make an obstructive process more plausible than a self-limited gastrointestinal illness?'
        ),
      },
      {
        challenge: q(
          'Emery’s new examination differs from the earlier review, with HR rising from 88 to 98, BP falling from 132/80 to 120/74 and RR rising from 19 to 22. Which interpretation best supports the next decision?',
          [
            [
              'These are still modest values, so the prior examination should remain the main guide.',
              'Magnitude alone can miss a coherent new trend and functional change.',
            ],
            [
              'The new examination and trajectory support a fresh clinical review.',
              'The change is evidence about the current condition, even without a classic focal pattern.',
            ],
            [
              'The pulse trend confirms that infection is the explanation.',
              'The trend is nonspecific and cannot establish the cause by itself.',
            ],
            [
              'The observations should be interpreted separately from the abdominal findings to avoid diagnostic bias.',
              'The clinical decision requires integration of the systemic, abdominal and functional findings.',
            ],
          ],
          [1],
          'Which part of the earlier record remains useful, and which conclusion needs to be tested again?'
        ),
        advanced: q(
          'Additional simulated record review: Emery’s earlier blood tests were within the laboratory intervals, but they preceded the new examination and functional decline. Which TWO uses of those results are appropriate?',
          [
            [
              'Treat them as a rule-out for a clinically significant abdominal process today.',
              'Earlier tests cannot by themselves rule out a new or evolving condition.',
            ],
            [
              'Ignore them entirely because the current symptoms are different.',
              'The earlier values can still be useful for comparison and interpretation of later results.',
            ],
            [
              'Include their timing in the handover so the team can judge what clinical state they actually sampled.',
              'A result belongs to a specific time and needs that context when the patient changes.',
            ],
            [
              'Compare them with the new examination and observations when discussing whether further investigation is needed.',
              'Reassessment integrates tests and current clinical evidence rather than allowing either to stand alone.',
            ],
          ],
          [2, 3],
          'Why does a result’s timing affect how much reassurance it can provide now?'
        ),
      },
      {
        challenge: q(
          'Emery briefly reports less pain but looks more unwell and moves with difficulty. BP is now 108/68 and RR 25. Which concern should lead the immediate reassessment?',
          [
            [
              'A worsening systemic and functional state despite less reported pain.',
              'The discordance makes pain relief insufficient evidence of recovery and changes the clinical priority.',
            ],
            [
              'Whether the lower pain score means the abdomen can be examined later.',
              'The changing overall condition makes timely examination more relevant, not less.',
            ],
            [
              'Whether family expectations are increasing the apparent severity of the episode.',
              'Family reports of a new functional change are relevant evidence that should be assessed rather than discounted.',
            ],
            [
              'Whether the diffuse pain pattern fits the most common diagnosis for Emery’s age.',
              'A common diagnosis does not resolve the current physiological decline or determine urgency.',
            ],
          ],
          [0],
          'What finding would tell you that the reduced pain score is not tracking the patient’s overall condition?'
        ),
        advanced: q(
          'Additional simulated assessment: Emery has new abdominal distension, repeated vomiting and little recent flatus. Which TWO statements best connect these findings to the current plan?',
          [
            [
              'The findings identify a simple constipation episode because appetite was already reduced.',
              'This explanation is not established and does not safely account for vomiting, distension and systemic change.',
            ],
            [
              'An obstructive process belongs in the differential and should be raised during urgent abdominal review.',
              'The symptom combination adds a clinically important possibility without independently confirming it.',
            ],
            [
              'Vomiting and poor intake make a perfusion/fluid-balance assessment relevant alongside the abdominal assessment.',
              'These symptoms may contribute to physiological change and require time-linked assessment of losses, intake and perfusion.',
            ],
            [
              'The temporary pain relief makes the new vomiting less concerning.',
              'A single improved symptom does not outweigh newly concerning associated findings.',
            ],
          ],
          [1, 2],
          'What history or examination would help distinguish obstruction from other causes without delaying the present review?'
        ),
      },
      {
        challenge: q(
          'A new clinician is reassessing Emery, whose BP is 98/62 and RR 28. Emery asks whether surgery is inevitable. Which approach best combines the urgent assessment with person-centred communication?',
          [
            [
              'Ask family to answer all questions so Emery can rest until a diagnosis is established.',
              'Support may help, but Emery’s own participation and preferences should be checked rather than automatically displaced.',
            ],
            [
              'Explain that atypical pain usually leads to observation rather than a procedure.',
              'The current trajectory does not justify that prediction.',
            ],
            [
              'Explain the urgent review, check understanding/sharing preferences, and keep options open.',
              'Clear communication, involvement and uncertainty can be maintained while urgent clinical assessment proceeds.',
            ],
            [
              'Focus on the technical investigation sequence before discussing Emery’s concerns.',
              'An investigation list alone may not explain why the plan changed or address the person’s immediate concern.',
            ],
          ],
          [2],
          'How would you check understanding if fatigue makes a long explanation difficult?'
        ),
        advanced: q(
          'Additional simulated planning: Emery’s imaging request still lists only “abdominal discomfort—earlier tests reassuring.” Which TWO updates would most improve the clinician–radiology discussion about the next investigation?',
          [
            [
              'A concise description of the changed examination, reduced function and current physiological trend.',
              'The new clinical state helps the team prioritize and select an investigation appropriate to the current question.',
            ],
            [
              'A definitive appendicitis label so the request cannot be considered nonspecific.',
              'False certainty can narrow the investigation incorrectly; the differential and clinical question should remain accurate.',
            ],
            [
              'Removal of the earlier results because they may encourage reassurance.',
              'Earlier results remain useful when their timing and limitations are clearly stated.',
            ],
            [
              'The current differential/clinical question and relevant safety information confirmed with the treating team.',
              'A specific question and patient context support a tailored diagnostic choice rather than a reflex test order.',
            ],
          ],
          [0, 3],
          'Which patient-specific information would the treating and imaging teams need before choosing the examination?'
        ),
      },
      {
        challenge: q(
          'Emery’s family asks whether the earlier reassuring results mean a new assessment is unnecessary. HR is now 110, BP 104/66 and RR 26. Which explanation is most accurate?',
          [
            [
              '“Those results describe the earlier assessment. Emery’s function and observations have changed, so the team needs to assess this new state.”',
              'This explains the value and limitation of the earlier evidence using the actual change that matters now.',
            ],
            [
              '“The earlier tests must have been wrong because the observations are worse.”',
              'A later change does not prove the earlier test was inaccurate; disease and the clinical state can evolve.',
            ],
            [
              '“New tests will be more accurate because more time has passed.”',
              'Timing can affect findings, but a blanket claim of greater accuracy is not justified.',
            ],
            [
              '“The pain is atypical for this age group, so earlier tests cannot tell us anything.”',
              'Atypical symptoms do not make previous information useless; it still needs appropriate temporal interpretation.',
            ],
          ],
          [0],
          'How would you explain the plan without blaming the earlier assessment or offering false reassurance?'
        ),
        advanced: q(
          'Additional simulated handover: you are told the review can wait until the next routine round because Emery’s temperature is only 38.0°C. Which TWO components make the escalation most effective?',
          [
            [
              'Lead with the suspected diagnosis and repeat it until a review is agreed.',
              'A diagnostic label alone communicates less than the evidence of a changing state and a specific request.',
            ],
            [
              'Compare the current pressure, breathing and function with the earlier baseline and state the unresolved concern.',
              'A concise trajectory explains why a modest fever does not settle the urgency.',
            ],
            [
              'Request a time-defined review and a named contingency if deterioration continues before that review.',
              'Clear responsibility, timing and a response to further change make the plan actionable.',
            ],
            [
              'Wait for another abnormal test result before challenging the routine-round plan.',
              'Clinical deterioration itself can justify escalation; a further test is not a required permission step.',
            ],
          ],
          [1, 2],
          'If the team cannot attend within the agreed time, how would your local escalation pathway address the continuing concern?'
        ),
      },
      {
        challenge: q(
          'After team care, Emery’s pain and observations improve, but eating and mobility remain under review. Which outcome would best demonstrate meaningful functional recovery?',
          [
            [
              'Emery agrees that the pain is less severe than earlier.',
              'This is valuable symptom information but does not establish the ability to manage the next care step.',
            ],
            [
              'The temperature falls to 37.6°C on one measurement.',
              'One improved measurement does not establish overall recovery.',
            ],
            [
              'The initial results remain in the record without a new diagnosis.',
              'Documentation status is not a clinical or functional outcome.',
            ],
            [
              'Usual mobility and agreed intake are returning without renewed symptoms.',
              'This evaluates functions that were affected and must be integrated with examination, observations and follow-up.',
            ],
          ],
          [3],
          'Which aspect of Emery’s baseline is needed to judge whether the current function is adequate?'
        ),
        advanced: q(
          'Additional simulated discharge discussion: Emery’s pain is lower, but walking still requires more help than usual and family cannot provide overnight support. Select THREE issues to resolve with the team before accepting a home-observation plan.',
          [
            [
              'Whether the current clinical review adequately accounts for persistent examination, observation or intake concerns.',
              'A lower pain score does not settle unresolved clinical issues or establish suitability for discharge.',
            ],
            [
              'Whether there is a feasible mobility/support arrangement and a way to obtain timely reassessment.',
              'A medically plausible plan can still be unsafe if the person cannot carry it out or obtain help.',
            ],
            [
              'Specific worsening symptoms, a contact route and a time-bound follow-up plan understood by Emery and any chosen supporter.',
              'An actionable safety net is especially important when the cause remains uncertain and function has changed.',
            ],
            [
              'Treating family telephone availability as sufficient support despite the new assistance needed for walking.',
              'Remote availability alone does not establish that Emery can manage a new need for physical assistance; the actual support arrangement needs assessment.',
            ],
          ],
          [0, 1, 2],
          'How would a realistic lack of home support change the options discussed, even with improving observations?'
        ),
      },
    ],
  },
}
