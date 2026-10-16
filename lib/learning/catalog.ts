import manifest from '@/qbank/bank.manifest.json'
import type { BankKey } from '@/qbank/banks'
export const practiceTopics = manifest.banks.map((bank) => ({
  ...bank,
  key: bank.key as BankKey,
  title:
    (
      {
        acute_mi: 'Acute coronary syndromes',
        anaphylaxis_mods_trauma_sedation: 'Critical care essentials',
        cv_hypertensive_crises: 'Hypertensive crises',
        heart_sounds: 'Heart sounds',
        multisystem_core_shock: 'Shock & perfusion',
        neuro_template: 'Neurologic assessment',
        pulm_template: 'Respiratory assessment',
        scenario_vignettes: 'Clinical vignettes',
        sepsis_septic_shock: 'Sepsis & shock',
        vascular_disease_core: 'Vascular disease',
      } as Record<string, string>
    )[bank.key] ?? bank.title,
  category: ['neuro_template'].includes(bank.key)
    ? 'Neuro'
    : ['pulm_template'].includes(bank.key)
      ? 'Respiratory'
      : [
            'anaphylaxis_mods_trauma_sedation',
            'multisystem_core_shock',
            'sepsis_septic_shock',
            'scenario_vignettes',
          ].includes(bank.key)
        ? 'Critical care'
        : 'Cardiovascular',
}))
