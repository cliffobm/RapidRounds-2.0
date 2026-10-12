// AUTO-GENERATED
import b0 from "./acute_mi.testbank.json";
import b1 from "./anaphylaxis_mods_trauma_sedation.testbank.json";
import b2 from "./cv_hypertensive_crises.testbank.json";
import b3 from "./heart_sounds.testbank.json";
import b4 from "./multisystem_core_shock.testbank.json";
import b5 from "./neuro_template.testbank.json";
import b6 from "./pulm_template.testbank.json";
import b7 from "./scenario_vignettes.testbank.json";
import b8 from "./sepsis_septic_shock.testbank.json";
import b9 from "./vascular_disease_core.testbank.json";

export const BANKS = {
  "acute_mi": b0,
  "anaphylaxis_mods_trauma_sedation": b1,
  "cv_hypertensive_crises": b2,
  "heart_sounds": b3,
  "multisystem_core_shock": b4,
  "neuro_template": b5,
  "pulm_template": b6,
  "scenario_vignettes": b7,
  "sepsis_septic_shock": b8,
  "vascular_disease_core": b9,
} as const;

export type BankKey = keyof typeof BANKS;
