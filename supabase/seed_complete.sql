-- Complete seed data for RapidRounds nursing education platform
-- This file contains all initial data for categories, scenarios, and questions

-- Insert categories
INSERT INTO categories (slug, name, description, icon, color, sort_order) VALUES
('cardiac', 'Cardiac', 'Heart and cardiovascular system conditions', '❤️', '#e74c3c', 1),
('respiratory', 'Respiratory', 'Lung and breathing system conditions', '🫁', '#3498db', 2),
('neuro', 'Neurological', 'Brain and nervous system conditions', '🧠', '#9b59b6', 3),
('musculoskeletal', 'Musculoskeletal', 'Bones, muscles, and joints conditions', '🦴', '#f39c12', 4),
('gastrointestinal', 'Gastrointestinal', 'Digestive system conditions', '🍽️', '#e67e22', 5),
('endocrine', 'Endocrine', 'Hormone and gland system conditions', '⚕️', '#1abc9c', 6),
('integumentary', 'Integumentary', 'Skin and related structures conditions', '🩹', '#2ecc71', 7),
('renal', 'Renal', 'Kidney and urinary system conditions', '🫘', '#34495e', 8),
('heme-onc', 'Hematology/Oncology', 'Blood and cancer conditions', '🩸', '#e91e63', 9),
('ob', 'Obstetrics', 'Pregnancy and childbirth conditions', '🤱', '#ff69b4', 10),
('peds', 'Pediatrics', 'Children and infant conditions', '👶', '#ffc0cb', 11),
('psych', 'Psychiatric', 'Mental health and behavioral conditions', '🧘', '#8e44ad', 12);

-- Insert sample scenarios for each category
-- Cardiac Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Acute Myocardial Infarction', 'A 58-year-old male presents with chest pain and diaphoresis. Manage his care through the critical first hours.', 
 '{"patient_info": {"name": "Mr. Smith", "age": 58, "gender": "male", "weight": 85, "height": 175, "allergies": ["penicillin"], "medications": ["metformin"], "medical_history": ["diabetes", "hypertension"]}, "vital_signs": {"temperature": 36.8, "blood_pressure": {"systolic": 160, "diastolic": 95}, "heart_rate": 110, "respiratory_rate": 22, "oxygen_saturation": 94, "pain_level": 9}, "history": "Patient reports sudden onset of crushing chest pain 2 hours ago, radiating to left arm. Diaphoretic and nauseous.", "presentation": "Patient appears anxious, clutching chest, diaphoretic, pale skin."}',
 'intermediate', 'cardiac', true, 20, 
 '["Recognize signs of acute MI", "Prioritize cardiac interventions", "Understand ECG interpretation", "Apply cardiac medication protocols"]',
 '["MI", "chest pain", "cardiac emergency", "ECG"]');

-- Respiratory Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Asthma Exacerbation', 'A 25-year-old female presents with severe shortness of breath and wheezing. Manage her acute asthma attack.',
 '{"patient_info": {"name": "Ms. Johnson", "age": 25, "gender": "female", "weight": 60, "height": 165, "allergies": ["none"], "medications": ["albuterol inhaler"], "medical_history": ["asthma"]}, "vital_signs": {"temperature": 37.2, "blood_pressure": {"systolic": 140, "diastolic": 90}, "heart_rate": 120, "respiratory_rate": 28, "oxygen_saturation": 88, "pain_level": 6}, "history": "Patient reports sudden onset of severe shortness of breath 1 hour ago, using rescue inhaler with no relief.", "presentation": "Patient sitting upright, using accessory muscles, audible wheezing, anxious appearance."}',
 'beginner', 'respiratory', true, 15,
 '["Recognize asthma exacerbation", "Prioritize respiratory interventions", "Understand bronchodilator therapy", "Apply oxygen therapy protocols"]',
 '["asthma", "respiratory distress", "bronchodilator", "oxygen therapy"]');

-- Neurological Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Stroke Assessment', 'A 72-year-old male presents with sudden onset of left-sided weakness and speech difficulty. Perform stroke assessment.',
 '{"patient_info": {"name": "Mr. Davis", "age": 72, "gender": "male", "weight": 80, "height": 180, "allergies": ["none"], "medications": ["warfarin"], "medical_history": ["atrial fibrillation", "hypertension"]}, "vital_signs": {"temperature": 36.5, "blood_pressure": {"systolic": 180, "diastolic": 100}, "heart_rate": 95, "respiratory_rate": 18, "oxygen_saturation": 96, "pain_level": 3}, "history": "Patient reports sudden onset of left arm and leg weakness 30 minutes ago, difficulty speaking clearly.", "presentation": "Patient alert but confused, left-sided facial droop, left arm and leg weakness, slurred speech."}',
 'advanced', 'neuro', true, 25,
 '["Recognize stroke symptoms", "Perform neurological assessment", "Understand stroke protocols", "Apply time-sensitive interventions"]',
 '["stroke", "neurological assessment", "facial droop", "weakness"]');

-- Musculoskeletal Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Hip Fracture', 'An 85-year-old female presents with hip pain after a fall. Manage her care and pain control.',
 '{"patient_info": {"name": "Mrs. Wilson", "age": 85, "gender": "female", "weight": 55, "height": 160, "allergies": ["morphine"], "medications": ["calcium", "vitamin D"], "medical_history": ["osteoporosis", "dementia"]}, "vital_signs": {"temperature": 36.2, "blood_pressure": {"systolic": 130, "diastolic": 80}, "heart_rate": 100, "respiratory_rate": 20, "oxygen_saturation": 98, "pain_level": 8}, "history": "Patient fell at home 2 hours ago, unable to bear weight on right leg, severe hip pain.", "presentation": "Patient lying in bed, right leg externally rotated, unable to move leg, grimacing with pain."}',
 'intermediate', 'musculoskeletal', true, 18,
 '["Assess hip fracture", "Manage acute pain", "Understand mobility restrictions", "Apply fall prevention strategies"]',
 '["hip fracture", "fall", "pain management", "mobility"]');

-- Gastrointestinal Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Appendicitis', 'A 16-year-old male presents with abdominal pain and nausea. Assess for appendicitis.',
 '{"patient_info": {"name": "Jake", "age": 16, "gender": "male", "weight": 65, "height": 175, "allergies": ["none"], "medications": ["none"], "medical_history": ["none"]}, "vital_signs": {"temperature": 38.5, "blood_pressure": {"systolic": 120, "diastolic": 75}, "heart_rate": 105, "respiratory_rate": 22, "oxygen_saturation": 98, "pain_level": 7}, "history": "Patient reports abdominal pain starting around umbilicus, now localized to right lower quadrant, nausea and vomiting.", "presentation": "Patient lying still, guarding abdomen, appears uncomfortable, slightly flushed."}',
 'beginner', 'gastrointestinal', true, 15,
 '["Recognize appendicitis symptoms", "Perform abdominal assessment", "Understand surgical preparation", "Apply pain management"]',
 '["appendicitis", "abdominal pain", "surgical emergency", "assessment"]');

-- Endocrine Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Diabetic Ketoacidosis', 'A 19-year-old female presents with nausea, vomiting, and altered mental status. Manage her DKA.',
 '{"patient_info": {"name": "Ms. Brown", "age": 19, "gender": "female", "weight": 50, "height": 165, "allergies": ["none"], "medications": ["insulin"], "medical_history": ["type 1 diabetes"]}, "vital_signs": {"temperature": 37.8, "blood_pressure": {"systolic": 100, "diastolic": 60}, "heart_rate": 130, "respiratory_rate": 30, "oxygen_saturation": 95, "pain_level": 4}, "history": "Patient reports 3 days of nausea, vomiting, increased thirst and urination, now confused and lethargic.", "presentation": "Patient lethargic, Kussmaul respirations, fruity breath odor, dry mucous membranes."}',
 'advanced', 'endocrine', true, 30,
 '["Recognize DKA symptoms", "Manage fluid and electrolyte balance", "Understand insulin therapy", "Apply critical care protocols"]',
 '["DKA", "diabetes", "ketoacidosis", "critical care"]');

-- Integumentary Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Pressure Ulcer', 'An 78-year-old bedbound patient has developed a stage 3 pressure ulcer. Manage wound care.',
 '{"patient_info": {"name": "Mr. Taylor", "age": 78, "gender": "male", "weight": 70, "height": 175, "allergies": ["none"], "medications": ["warfarin"], "medical_history": ["stroke", "immobility"]}, "vital_signs": {"temperature": 37.5, "blood_pressure": {"systolic": 140, "diastolic": 85}, "heart_rate": 95, "respiratory_rate": 18, "oxygen_saturation": 96, "pain_level": 5}, "history": "Patient has been bedbound for 3 months post-stroke, developed pressure ulcer on sacrum 1 week ago.", "presentation": "Patient lying in bed, stage 3 pressure ulcer on sacrum with surrounding erythema, patient appears uncomfortable."}',
 'intermediate', 'integumentary', true, 20,
 '["Assess pressure ulcer staging", "Implement wound care protocols", "Understand pressure relief strategies", "Apply infection prevention"]',
 '["pressure ulcer", "wound care", "immobility", "staging"]');

-- Renal Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Acute Kidney Injury', 'A 65-year-old male presents with decreased urine output and fluid overload. Manage his AKI.',
 '{"patient_info": {"name": "Mr. Garcia", "age": 65, "gender": "male", "weight": 90, "height": 175, "allergies": ["none"], "medications": ["furosemide"], "medical_history": ["heart failure", "diabetes"]}, "vital_signs": {"temperature": 36.8, "blood_pressure": {"systolic": 160, "diastolic": 100}, "heart_rate": 110, "respiratory_rate": 24, "oxygen_saturation": 92, "pain_level": 6}, "history": "Patient reports decreased urine output over 3 days, swelling in legs and abdomen, shortness of breath.", "presentation": "Patient appears edematous, bilateral lower extremity swelling, ascites, labored breathing."}',
 'advanced', 'renal', true, 25,
 '["Recognize AKI symptoms", "Manage fluid balance", "Understand renal function", "Apply dialysis protocols"]',
 '["AKI", "kidney injury", "fluid overload", "dialysis"]');

-- Hematology/Oncology Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Neutropenic Fever', 'A 45-year-old female on chemotherapy presents with fever and signs of infection. Manage her neutropenic fever.',
 '{"patient_info": {"name": "Ms. Lee", "age": 45, "gender": "female", "weight": 60, "height": 165, "allergies": ["penicillin"], "medications": ["chemotherapy"], "medical_history": ["breast cancer", "neutropenia"]}, "vital_signs": {"temperature": 39.2, "blood_pressure": {"systolic": 110, "diastolic": 70}, "heart_rate": 120, "respiratory_rate": 26, "oxygen_saturation": 94, "pain_level": 7}, "history": "Patient reports fever and chills for 6 hours, fatigue, and mild shortness of breath. Recent chemotherapy 5 days ago.", "presentation": "Patient appears febrile, flushed, slightly confused, mild respiratory distress."}',
 'advanced', 'heme-onc', true, 25,
 '["Recognize neutropenic fever", "Manage immunocompromised patients", "Understand infection protocols", "Apply critical care interventions"]',
 '["neutropenic fever", "chemotherapy", "immunocompromised", "infection"]');

-- Obstetrics Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Pre-eclampsia', 'A 28-year-old pregnant female presents with high blood pressure and proteinuria. Manage her pre-eclampsia.',
 '{"patient_info": {"name": "Ms. Rodriguez", "age": 28, "gender": "female", "weight": 75, "height": 165, "allergies": ["none"], "medications": ["prenatal vitamins"], "medical_history": ["first pregnancy"]}, "vital_signs": {"temperature": 36.8, "blood_pressure": {"systolic": 160, "diastolic": 105}, "heart_rate": 100, "respiratory_rate": 20, "oxygen_saturation": 98, "pain_level": 6}, "history": "Patient reports headaches, visual changes, and swelling in hands and face for 2 days. 32 weeks pregnant.", "presentation": "Patient appears edematous, especially in face and hands, appears uncomfortable, slightly confused."}',
 'intermediate', 'ob', true, 20,
 '["Recognize pre-eclampsia symptoms", "Manage hypertensive crisis", "Understand pregnancy complications", "Apply maternal-fetal monitoring"]',
 '["pre-eclampsia", "pregnancy", "hypertension", "maternal-fetal"]');

-- Pediatrics Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Febrile Seizure', 'A 2-year-old child presents with fever and seizure activity. Manage her febrile seizure.',
 '{"patient_info": {"name": "Emma", "age": 2, "gender": "female", "weight": 12, "height": 85, "allergies": ["none"], "medications": ["none"], "medical_history": ["none"]}, "vital_signs": {"temperature": 39.8, "blood_pressure": {"systolic": 90, "diastolic": 60}, "heart_rate": 140, "respiratory_rate": 30, "oxygen_saturation": 95, "pain_level": 8}, "history": "Child had sudden onset of generalized tonic-clonic seizure 10 minutes ago, high fever, parents very distressed.", "presentation": "Child post-ictal, drowsy, febrile, parents crying and anxious, child appears flushed."}',
 'beginner', 'peds', true, 15,
 '["Recognize febrile seizures", "Manage pediatric emergencies", "Understand fever management", "Apply family-centered care"]',
 '["febrile seizure", "pediatrics", "fever", "emergency"]');

-- Psychiatric Scenario
INSERT INTO scenarios (title, description, content, difficulty, category, is_published, estimated_duration, learning_objectives, tags) VALUES
('Suicidal Ideation', 'A 24-year-old female presents with depression and suicidal thoughts. Provide crisis intervention.',
 '{"patient_info": {"name": "Ms. Kim", "age": 24, "gender": "female", "weight": 55, "height": 165, "allergies": ["none"], "medications": ["sertraline"], "medical_history": ["depression", "anxiety"]}, "vital_signs": {"temperature": 36.5, "blood_pressure": {"systolic": 120, "diastolic": 80}, "heart_rate": 95, "respiratory_rate": 18, "oxygen_saturation": 98, "pain_level": 8}, "history": "Patient reports feeling hopeless, having thoughts of self-harm, difficulty sleeping, loss of appetite for 2 weeks.", "presentation": "Patient appears sad, withdrawn, poor eye contact, appears to have been crying, wearing long sleeves."}',
 'intermediate', 'psych', true, 20,
 '["Recognize suicidal ideation", "Provide crisis intervention", "Understand mental health assessment", "Apply therapeutic communication"]',
 '["suicidal ideation", "depression", "crisis intervention", "mental health"]');

-- Update scenarios with category_id references
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'cardiac') WHERE category = 'cardiac';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'respiratory') WHERE category = 'respiratory';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'neuro') WHERE category = 'neuro';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'musculoskeletal') WHERE category = 'musculoskeletal';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'gastrointestinal') WHERE category = 'gastrointestinal';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'endocrine') WHERE category = 'endocrine';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'integumentary') WHERE category = 'integumentary';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'renal') WHERE category = 'renal';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'heme-onc') WHERE category = 'heme-onc';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'ob') WHERE category = 'ob';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'peds') WHERE category = 'peds';
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'psych') WHERE category = 'psych';

-- Insert sample questions for each scenario
-- Cardiac scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Acute Myocardial Infarction'), 'What is the priority nursing intervention for this patient?', 'multiple_choice', 
 '["Administer oxygen", "Start IV access", "Obtain ECG", "Give pain medication"]', 
 '"Administer oxygen"', 
 'Oxygen is the priority to improve myocardial oxygenation and reduce infarct size.', 
 'In acute MI, oxygen therapy is the first priority to improve oxygen delivery to the heart muscle.', 2, 'intermediate', 'Assessment', 30);

INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Acute Myocardial Infarction'), 'Which medication should be given first?', 'multiple_choice', 
 '["Aspirin", "Morphine", "Nitroglycerin", "Heparin"]', 
 '"Aspirin"', 
 'Aspirin should be given first as it reduces platelet aggregation and improves outcomes.', 
 'Aspirin is the first-line medication for acute MI as it reduces mortality and prevents further clot formation.', 2, 'intermediate', 'Intervention', 30);

-- Respiratory scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Asthma Exacerbation'), 'What is the first-line treatment for this patient?', 'multiple_choice', 
 '["Oral steroids", "Inhaled bronchodilators", "Antibiotics", "Oxygen therapy"]', 
 '"Inhaled bronchodilators"', 
 'Inhaled bronchodilators are the first-line treatment for asthma exacerbation.', 
 'Short-acting beta-agonists like albuterol are the first-line treatment for acute asthma exacerbation.', 2, 'beginner', 'Intervention', 30);

-- Neurological scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Stroke Assessment'), 'What is the most important factor in stroke treatment?', 'multiple_choice', 
 '["Time to treatment", "Patient age", "Stroke severity", "Medical history"]', 
 '"Time to treatment"', 
 'Time is critical in stroke treatment - the sooner treatment begins, the better the outcome.', 
 'Time is brain - every minute counts in stroke treatment. Early intervention improves outcomes significantly.', 2, 'advanced', 'Assessment', 30);

-- Musculoskeletal scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Hip Fracture'), 'What is the priority nursing intervention?', 'multiple_choice', 
 '["Pain management", "Mobility assessment", "Fall prevention", "Nutrition assessment"]', 
 '"Pain management"', 
 'Pain management is the priority for hip fracture patients to improve comfort and mobility.', 
 'Effective pain management is essential for hip fracture patients to enable mobility and prevent complications.', 2, 'intermediate', 'Intervention', 30);

-- Gastrointestinal scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Appendicitis'), 'What is the most important assessment finding?', 'multiple_choice', 
 '["Rebound tenderness", "Bowel sounds", "Abdominal distension", "Nausea"]', 
 '"Rebound tenderness"', 
 'Rebound tenderness is a key sign of peritonitis and appendicitis.', 
 'Rebound tenderness indicates peritoneal inflammation and is a classic sign of appendicitis.', 2, 'beginner', 'Assessment', 30);

-- Endocrine scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Diabetic Ketoacidosis'), 'What is the priority intervention?', 'multiple_choice', 
 '["Insulin therapy", "Fluid replacement", "Electrolyte replacement", "Glucose monitoring"]', 
 '"Fluid replacement"', 
 'Fluid replacement is the priority to correct dehydration and improve circulation.', 
 'Fluid replacement is the first priority in DKA to correct dehydration and improve tissue perfusion.', 2, 'advanced', 'Intervention', 30);

-- Integumentary scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Pressure Ulcer'), 'What is the most important prevention strategy?', 'multiple_choice', 
 '["Wound care", "Pressure relief", "Nutrition", "Hygiene"]', 
 '"Pressure relief"', 
 'Pressure relief is the most important strategy to prevent pressure ulcers.', 
 'Regular repositioning and pressure relief are the most effective ways to prevent pressure ulcers.', 2, 'intermediate', 'Prevention', 30);

-- Renal scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Acute Kidney Injury'), 'What is the priority assessment?', 'multiple_choice', 
 '["Urine output", "Blood pressure", "Heart rate", "Temperature"]', 
 '"Urine output"', 
 'Urine output is the most important indicator of kidney function.', 
 'Urine output is the primary indicator of kidney function and should be monitored closely in AKI.', 2, 'advanced', 'Assessment', 30);

-- Hematology/Oncology scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Neutropenic Fever'), 'What is the priority intervention?', 'multiple_choice', 
 '["Antibiotics", "Fever reduction", "Isolation", "Blood cultures"]', 
 '"Antibiotics"', 
 'Antibiotics should be given immediately for neutropenic fever as it can be life-threatening.', 
 'Neutropenic fever is a medical emergency requiring immediate antibiotic therapy to prevent sepsis.', 2, 'advanced', 'Intervention', 30);

-- Obstetrics scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Pre-eclampsia'), 'What is the most important monitoring parameter?', 'multiple_choice', 
 '["Blood pressure", "Fetal heart rate", "Urine output", "Weight"]', 
 '"Blood pressure"', 
 'Blood pressure monitoring is critical in pre-eclampsia to prevent complications.', 
 'Blood pressure monitoring is essential in pre-eclampsia to prevent eclampsia and other complications.', 2, 'intermediate', 'Assessment', 30);

-- Pediatrics scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Febrile Seizure'), 'What is the priority intervention?', 'multiple_choice', 
 '["Fever reduction", "Seizure management", "Airway protection", "Parent education"]', 
 '"Airway protection"', 
 'Airway protection is the priority during a seizure to prevent aspiration.', 
 'During a seizure, protecting the airway is the most important intervention to prevent complications.', 2, 'beginner', 'Intervention', 30);

-- Psychiatric scenario questions
INSERT INTO questions (scenario_id, question_text, question_type, options, correct_answer, explanation, rationale, points, difficulty, category, time_limit) VALUES
((SELECT id FROM scenarios WHERE title = 'Suicidal Ideation'), 'What is the most important question to ask?', 'multiple_choice', 
 '["Do you have a plan?", "Are you depressed?", "Do you want help?", "Have you tried before?"]', 
 '"Do you have a plan?"', 
 'Asking about a specific plan is crucial for assessing suicide risk.', 
 'Asking about a specific suicide plan is essential for risk assessment and determining appropriate interventions.', 2, 'intermediate', 'Assessment', 30);

-- Insert sample profile options
INSERT INTO profile_options (user_id, option_key, option_value) VALUES
('00000000-0000-0000-0000-000000000000', 'theme', '{"preferred_theme": "light", "accent_color": "#3498db"}'),
('00000000-0000-0000-0000-000000000000', 'notifications', '{"email_notifications": true, "push_notifications": false, "scenario_reminders": true}'),
('00000000-0000-0000-0000-000000000000', 'learning_preferences', '{"difficulty_level": "intermediate", "scenario_types": ["clinical", "simulation"], "study_mode": "interactive"}');

-- Insert scenario-category relationships
INSERT INTO scenario_categories (scenario_id, category_id, is_primary) VALUES
((SELECT id FROM scenarios WHERE title = 'Acute Myocardial Infarction'), (SELECT id FROM categories WHERE slug = 'cardiac'), true),
((SELECT id FROM scenarios WHERE title = 'Asthma Exacerbation'), (SELECT id FROM categories WHERE slug = 'respiratory'), true),
((SELECT id FROM scenarios WHERE title = 'Stroke Assessment'), (SELECT id FROM categories WHERE slug = 'neuro'), true),
((SELECT id FROM scenarios WHERE title = 'Hip Fracture'), (SELECT id FROM categories WHERE slug = 'musculoskeletal'), true),
((SELECT id FROM scenarios WHERE title = 'Appendicitis'), (SELECT id FROM categories WHERE slug = 'gastrointestinal'), true),
((SELECT id FROM scenarios WHERE title = 'Diabetic Ketoacidosis'), (SELECT id FROM categories WHERE slug = 'endocrine'), true),
((SELECT id FROM scenarios WHERE title = 'Pressure Ulcer'), (SELECT id FROM categories WHERE slug = 'integumentary'), true),
((SELECT id FROM scenarios WHERE title = 'Acute Kidney Injury'), (SELECT id FROM categories WHERE slug = 'renal'), true),
((SELECT id FROM scenarios WHERE title = 'Neutropenic Fever'), (SELECT id FROM categories WHERE slug = 'heme-onc'), true),
((SELECT id FROM scenarios WHERE title = 'Pre-eclampsia'), (SELECT id FROM categories WHERE slug = 'ob'), true),
((SELECT id FROM scenarios WHERE title = 'Febrile Seizure'), (SELECT id FROM categories WHERE slug = 'peds'), true),
((SELECT id FROM scenarios WHERE title = 'Suicidal Ideation'), (SELECT id FROM categories WHERE slug = 'psych'), true);
