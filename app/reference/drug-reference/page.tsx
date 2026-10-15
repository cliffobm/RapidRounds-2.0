'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Pill, 
  AlertTriangle, 
  Heart, 
  Brain,
  Shield,
  Clock,
  Users,
  ArrowLeft,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Comprehensive drug reference data (2024 guidelines)
const drugDatabase = [
  {
    id: 'morphine',
    name: 'Morphine',
    genericName: 'Morphine Sulfate',
    category: 'Opioid Analgesic',
    class: 'Mu-opioid receptor agonist',
    indications: ['Severe pain', 'Post-operative pain', 'Cancer pain', 'Acute MI pain'],
    contraindications: ['Respiratory depression', 'Severe asthma', 'Paralytic ileus', 'Hypersensitivity'],
    dosage: {
      adult: '2.5-10mg IV/IM q2-4h PRN',
      pediatric: '0.05-0.1mg/kg IV/IM q2-4h PRN',
      elderly: 'Start with lower doses, titrate carefully'
    },
    sideEffects: ['Respiratory depression', 'Sedation', 'Nausea/vomiting', 'Constipation', 'Hypotension'],
    interactions: ['CNS depressants', 'MAO inhibitors', 'Alcohol'],
    monitoring: ['Respiratory rate', 'Blood pressure', 'Pain level', 'Sedation level'],
    pregnancy: 'Category C - Use with caution',
    notes: 'Monitor closely for respiratory depression. Have naloxone available.'
  },
  {
    id: 'furosemide',
    name: 'Furosemide',
    genericName: 'Furosemide',
    category: 'Loop Diuretic',
    class: 'Sulfonamide derivative',
    indications: ['Edema', 'Heart failure', 'Hypertension', 'Renal failure'],
    contraindications: ['Anuria', 'Hypersensitivity to sulfonamides', 'Severe electrolyte depletion'],
    dosage: {
      adult: '20-80mg PO daily or 20-40mg IV/IM',
      pediatric: '1-2mg/kg PO/IV daily',
      elderly: 'Start with lower doses'
    },
    sideEffects: ['Hypokalemia', 'Dehydration', 'Hypotension', 'Ototoxicity', 'Hyperglycemia'],
    interactions: ['Digoxin', 'Lithium', 'NSAIDs', 'Aminoglycosides'],
    monitoring: ['Electrolytes', 'Renal function', 'Blood pressure', 'Weight', 'Hearing'],
    pregnancy: 'Category C - Use with caution',
    notes: 'Monitor electrolytes closely. May cause ototoxicity with high doses.'
  },
  {
    id: 'metformin',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    category: 'Antidiabetic',
    class: 'Biguanide',
    indications: ['Type 2 diabetes', 'PCOS', 'Prediabetes'],
    contraindications: ['Renal impairment (eGFR <30)', 'Severe heart failure', 'Lactic acidosis risk'],
    dosage: {
      adult: '500-1000mg PO BID with meals',
      pediatric: 'Not recommended <10 years',
      elderly: 'Monitor renal function closely'
    },
    sideEffects: ['GI upset', 'Lactic acidosis', 'Vitamin B12 deficiency', 'Metallic taste'],
    interactions: ['Contrast media', 'Alcohol', 'Cimetidine'],
    monitoring: ['Blood glucose', 'Renal function', 'B12 levels', 'Lactic acid'],
    pregnancy: 'Category B - Generally safe',
    notes: 'Hold 48 hours before/after contrast studies. Monitor for lactic acidosis.'
  },
  {
    id: 'warfarin',
    name: 'Warfarin',
    genericName: 'Warfarin Sodium',
    category: 'Anticoagulant',
    class: 'Vitamin K antagonist',
    indications: ['Atrial fibrillation', 'DVT/PE', 'Mechanical heart valves', 'Stroke prevention'],
    contraindications: ['Active bleeding', 'Severe liver disease', 'Pregnancy', 'Uncontrolled hypertension'],
    dosage: {
      adult: '2-10mg PO daily (dose varies by INR)',
      pediatric: '0.1-0.2mg/kg PO daily',
      elderly: 'Start with lower doses'
    },
    sideEffects: ['Bleeding', 'Bruising', 'Hair loss', 'Skin necrosis'],
    interactions: ['Many drugs affect INR', 'Vitamin K', 'Alcohol', 'Antibiotics'],
    monitoring: ['INR (target 2-3)', 'CBC', 'Signs of bleeding'],
    pregnancy: 'Category X - Contraindicated',
    notes: 'Requires frequent INR monitoring. Patient education crucial.'
  },
  {
    id: 'digoxin',
    name: 'Digoxin',
    genericName: 'Digoxin',
    category: 'Cardiac Glycoside',
    class: 'Digitalis glycoside',
    indications: ['Heart failure', 'Atrial fibrillation', 'Atrial flutter'],
    contraindications: ['Ventricular fibrillation', 'Hypersensitivity', 'Digitalis toxicity'],
    dosage: {
      adult: '0.125-0.25mg PO daily',
      pediatric: '0.005-0.01mg/kg PO daily',
      elderly: 'Start with lower doses'
    },
    sideEffects: ['Nausea/vomiting', 'Bradycardia', 'Visual disturbances', 'Confusion'],
    interactions: ['Furosemide', 'Quinidine', 'Verapamil', 'Amiodarone'],
    monitoring: ['Heart rate', 'Digoxin level', 'ECG', 'Renal function'],
    pregnancy: 'Category C - Use with caution',
    notes: 'Narrow therapeutic window. Monitor for toxicity signs.'
  },
  {
    id: 'lisinopril',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    category: 'ACE Inhibitor',
    class: 'Angiotensin-converting enzyme inhibitor',
    indications: ['Hypertension', 'Heart failure', 'Post-MI', 'Diabetic nephropathy'],
    contraindications: ['Pregnancy', 'Angioedema history', 'Bilateral renal artery stenosis'],
    dosage: {
      adult: '5-40mg PO daily',
      pediatric: '0.1-0.6mg/kg PO daily (max 40mg)',
      elderly: 'Start with 2.5mg daily'
    },
    sideEffects: ['Dry cough', 'Hyperkalemia', 'Hypotension', 'Angioedema', 'Renal impairment'],
    interactions: ['Potassium supplements', 'NSAIDs', 'Diuretics', 'Lithium'],
    monitoring: ['Blood pressure', 'Renal function', 'Potassium levels', 'Cough'],
    pregnancy: 'Category D - Contraindicated',
    notes: 'Monitor for persistent dry cough. Check renal function within 1-2 weeks.'
  },
  {
    id: 'amiodarone',
    name: 'Amiodarone',
    genericName: 'Amiodarone HCl',
    category: 'Antiarrhythmic',
    class: 'Class III antiarrhythmic',
    indications: ['Ventricular arrhythmias', 'Atrial fibrillation', 'Atrial flutter'],
    contraindications: ['Severe sinus node dysfunction', 'AV block', 'Cardiogenic shock'],
    dosage: {
      adult: 'Loading: 800-1600mg/day x 1-3 weeks, then 200-400mg/day',
      pediatric: '5-15mg/kg/day PO',
      elderly: 'Use lower maintenance doses'
    },
    sideEffects: ['Pulmonary toxicity', 'Thyroid dysfunction', 'Liver toxicity', 'Blue-gray skin'],
    interactions: ['Warfarin', 'Digoxin', 'Beta-blockers', 'Calcium channel blockers'],
    monitoring: ['Thyroid function', 'Liver enzymes', 'Pulmonary function', 'ECG'],
    pregnancy: 'Category D - Use with caution',
    notes: 'Requires baseline chest X-ray, thyroid, and liver function tests.'
  },
  {
    id: 'insulin-regular',
    name: 'Regular Insulin',
    genericName: 'Human Insulin',
    category: 'Antidiabetic',
    class: 'Short-acting insulin',
    indications: ['Type 1 diabetes', 'Type 2 diabetes', 'DKA', 'Hyperkalemia'],
    contraindications: ['Hypoglycemia', 'Hypersensitivity to insulin'],
    dosage: {
      adult: '0.5-1 unit/kg/day SC divided doses',
      pediatric: '0.5-1.2 units/kg/day SC divided',
      elderly: 'Start with lower doses, adjust carefully'
    },
    sideEffects: ['Hypoglycemia', 'Weight gain', 'Injection site reactions', 'Hypokalemia'],
    interactions: ['Beta-blockers', 'ACE inhibitors', 'Alcohol', 'Corticosteroids'],
    monitoring: ['Blood glucose', 'HbA1c', 'Signs of hypoglycemia', 'Injection sites'],
    pregnancy: 'Category B - Preferred in pregnancy',
    notes: 'Onset 30-60 min, peak 2-3 hours, duration 8-12 hours.'
  },
  {
    id: 'vancomycin',
    name: 'Vancomycin',
    genericName: 'Vancomycin HCl',
    category: 'Antibiotic',
    class: 'Glycopeptide antibiotic',
    indications: ['MRSA infections', 'C. diff colitis', 'Endocarditis', 'Severe gram-positive infections'],
    contraindications: ['Hypersensitivity to vancomycin', 'Previous red man syndrome'],
    dosage: {
      adult: '15-20mg/kg IV q8-12h (max 2g/dose)',
      pediatric: '10-15mg/kg IV q6h',
      elderly: 'Adjust for renal function'
    },
    sideEffects: ['Nephrotoxicity', 'Ototoxicity', 'Red man syndrome', 'Thrombophlebitis'],
    interactions: ['Aminoglycosides', 'Loop diuretics', 'NSAIDs'],
    monitoring: ['Vancomycin trough levels', 'Renal function', 'Hearing', 'Infusion rate'],
    pregnancy: 'Category C - Use if benefits outweigh risks',
    notes: 'Target trough 15-20 mcg/mL. Infuse over at least 60 minutes.'
  },
  {
    id: 'heparin',
    name: 'Heparin',
    genericName: 'Heparin Sodium',
    category: 'Anticoagulant',
    class: 'Unfractionated heparin',
    indications: ['DVT/PE', 'Acute coronary syndrome', 'Stroke prevention', 'Dialysis'],
    contraindications: ['Active bleeding', 'Severe thrombocytopenia', 'Uncontrolled hypertension'],
    dosage: {
      adult: 'Loading: 80 units/kg IV, then 18 units/kg/hr',
      pediatric: '75-100 units/kg IV loading, then 25-30 units/kg/hr',
      elderly: 'Monitor closely, may need dose reduction'
    },
    sideEffects: ['Bleeding', 'Thrombocytopenia (HIT)', 'Osteoporosis', 'Hyperkalemia'],
    interactions: ['Antiplatelet agents', 'Warfarin', 'NSAIDs', 'Thrombolytics'],
    monitoring: ['aPTT (target 1.5-2.5x control)', 'Platelet count', 'Signs of bleeding'],
    pregnancy: 'Category C - Does not cross placenta',
    notes: 'Monitor for heparin-induced thrombocytopenia (HIT).'
  },
  {
    id: 'prednisone',
    name: 'Prednisone',
    genericName: 'Prednisone',
    category: 'Corticosteroid',
    class: 'Synthetic glucocorticoid',
    indications: ['Asthma', 'COPD exacerbation', 'Inflammatory conditions', 'Allergic reactions'],
    contraindications: ['Systemic fungal infections', 'Live vaccines', 'Hypersensitivity'],
    dosage: {
      adult: '5-60mg PO daily (varies by indication)',
      pediatric: '0.5-2mg/kg/day PO divided',
      elderly: 'Use lowest effective dose'
    },
    sideEffects: ['Hyperglycemia', 'Weight gain', 'Mood changes', 'Immunosuppression', 'Osteoporosis'],
    interactions: ['NSAIDs', 'Warfarin', 'Insulin', 'Live vaccines'],
    monitoring: ['Blood glucose', 'Blood pressure', 'Bone density', 'Mood changes'],
    pregnancy: 'Category C - Use if benefits outweigh risks',
    notes: 'Taper gradually if used >7-10 days. Take with food to reduce GI upset.'
  },
  {
    id: 'albuterol',
    name: 'Albuterol',
    genericName: 'Albuterol Sulfate',
    category: 'Bronchodilator',
    class: 'Short-acting beta-2 agonist',
    indications: ['Asthma', 'COPD', 'Bronchospasm', 'Exercise-induced bronchospasm'],
    contraindications: ['Hypersensitivity to albuterol', 'Tachyarrhythmias'],
    dosage: {
      adult: '2 puffs q4-6h PRN or 2.5mg nebulized q6-8h',
      pediatric: '1-2 puffs q4-6h PRN or 1.25-2.5mg nebulized',
      elderly: 'Same as adult, monitor for cardiac effects'
    },
    sideEffects: ['Tachycardia', 'Tremor', 'Nervousness', 'Hypokalemia', 'Hyperglycemia'],
    interactions: ['Beta-blockers', 'MAO inhibitors', 'Tricyclic antidepressants'],
    monitoring: ['Heart rate', 'Blood pressure', 'Respiratory status', 'Potassium levels'],
    pregnancy: 'Category C - Generally safe in pregnancy',
    notes: 'Rinse mouth after use. Overuse may indicate poor asthma control.'
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    category: 'Lipid-Lowering Agent',
    class: 'HMG-CoA reductase inhibitor (statin)',
    indications: ['Hyperlipidemia', 'Cardiovascular disease prevention', 'Familial hypercholesterolemia'],
    contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding', 'Hypersensitivity'],
    dosage: {
      adult: '10-80mg PO daily in evening',
      pediatric: '10-20mg PO daily (>10 years)',
      elderly: 'Start with 10mg daily'
    },
    sideEffects: ['Myalgia', 'Elevated liver enzymes', 'Rhabdomyolysis', 'Diabetes risk'],
    interactions: ['Cyclosporine', 'Gemfibrozil', 'Erythromycin', 'Grapefruit juice'],
    monitoring: ['Lipid panel', 'Liver enzymes', 'CK if muscle symptoms', 'Diabetes screening'],
    pregnancy: 'Category X - Contraindicated',
    notes: 'Take in evening for optimal effect. Report muscle pain immediately.'
  }
]

const categories = [
  { id: 'all', name: 'All', icon: Pill },
  { id: 'analgesic', name: 'Analgesics', icon: Heart },
  { id: 'cardiac', name: 'Cardiac', icon: Heart },
  { id: 'diuretic', name: 'Diuretics', icon: Shield },
  { id: 'antidiabetic', name: 'Antidiabetics', icon: Brain },
  { id: 'anticoagulant', name: 'Anticoagulants', icon: Shield },
  { id: 'ace inhibitor', name: 'ACE Inhibitors', icon: Heart },
  { id: 'antiarrhythmic', name: 'Antiarrhythmics', icon: Activity },
  { id: 'antibiotic', name: 'Antibiotics', icon: Shield },
  { id: 'corticosteroid', name: 'Corticosteroids', icon: Zap },
  { id: 'bronchodilator', name: 'Bronchodilators', icon: Users },
  { id: 'lipid-lowering', name: 'Lipid-Lowering', icon: TrendingUp }
]

export default function DrugReferencePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDrug, setSelectedDrug] = useState<any>(null)

  const filteredDrugs = drugDatabase.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drug.indications.some(ind => ind.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
                           drug.category.toLowerCase().includes(selectedCategory.toLowerCase())
    
    return matchesSearch && matchesCategory
  })

  if (selectedDrug) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline"
            onClick={() => setSelectedDrug(null)}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Drug List</span>
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedDrug.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedDrug.genericName} • {selectedDrug.category}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Drug Class</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedDrug.class}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Indications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrug.indications.map((indication: string, index: number) => (
                    <Badge key={index} variant="outline">{indication}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Contraindications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrug.contraindications.map((contra: string, index: number) => (
                    <Badge key={index} variant="danger">{contra}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dosage Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Adult Dosage</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedDrug.dosage.adult}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Pediatric Dosage</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedDrug.dosage.pediatric}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Elderly Considerations</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedDrug.dosage.elderly}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span>Side Effects & Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Common Side Effects</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrug.sideEffects.map((effect: string, index: number) => (
                    <Badge key={index} variant="warning">{effect}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Monitoring Parameters</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrug.monitoring.map((param: string, index: number) => (
                    <Badge key={index} variant="accent">{param}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Drug Interactions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrug.interactions.map((interaction: string, index: number) => (
                    <Badge key={index} variant="outline">{interaction}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Pregnancy Category</h4>
                <Badge variant="secondary">{selectedDrug.pregnancy}</Badge>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Important Notes</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedDrug.notes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/study')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Study</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Pill className="w-6 h-6 text-blue-600" />
              <span>Drug Reference</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive medication information and dosing guidelines
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search drugs, indications, or generic names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drug List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrugs.map((drug) => (
          <Card 
            key={drug.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedDrug(drug)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
                <Badge variant="outline">{drug.category}</Badge>
              </div>
              <CardTitle className="text-lg">{drug.name}</CardTitle>
              <CardDescription>{drug.genericName}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Indications</h4>
                  <div className="flex flex-wrap gap-1">
                    {drug.indications.slice(0, 2).map((indication, index) => (
                      <Badge key={index} variant="outline" size="sm">{indication}</Badge>
                    ))}
                    {drug.indications.length > 2 && (
                      <Badge variant="secondary" size="sm">+{drug.indications.length - 2} more</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Adult Dosage</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{drug.dosage.adult}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Updated 2024</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); setSelectedDrug(drug) }}>View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrugs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Pill className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No drugs found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search terms or category filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
