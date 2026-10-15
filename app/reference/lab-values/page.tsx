'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Heart,
  Brain,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Comprehensive lab values reference (2024 guidelines)
const labValues = [
  {
    category: 'Complete Blood Count (CBC)',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    tests: [
      {
        name: 'Hemoglobin (Hgb)',
        normalRange: 'Male: 13.8-17.2 g/dL\nFemale: 12.1-15.1 g/dL',
        critical: 'Male: <8.0 or >20.0 g/dL\nFemale: <7.0 or >18.0 g/dL',
        units: 'g/dL',
        clinicalSignificance: 'Oxygen-carrying capacity of blood. Low values indicate anemia, high values may indicate polycythemia.'
      },
      {
        name: 'Hematocrit (Hct)',
        normalRange: 'Male: 40.7-50.3%\nFemale: 36.1-44.3%',
        critical: 'Male: <24% or >60%\nFemale: <21% or >54%',
        units: '%',
        clinicalSignificance: 'Percentage of blood volume occupied by red blood cells. Correlates with hemoglobin levels.'
      },
      {
        name: 'White Blood Cell Count (WBC)',
        normalRange: '4,500-11,000 cells/μL',
        critical: '<2,000 or >30,000 cells/μL',
        units: 'cells/μL',
        clinicalSignificance: 'Immune system function. Elevated in infection, inflammation, leukemia. Low in immunosuppression.'
      },
      {
        name: 'Platelet Count',
        normalRange: '150,000-450,000 cells/μL',
        critical: '<50,000 or >1,000,000 cells/μL',
        units: 'cells/μL',
        clinicalSignificance: 'Blood clotting function. Low values increase bleeding risk, high values increase clotting risk.'
      }
    ]
  },
  {
    category: 'Basic Metabolic Panel (BMP)',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    tests: [
      {
        name: 'Glucose',
        normalRange: '70-100 mg/dL (fasting)',
        critical: '<40 or >400 mg/dL',
        units: 'mg/dL',
        clinicalSignificance: 'Blood sugar level. Critical for diabetes management and hypoglycemia detection.'
      },
      {
        name: 'Sodium (Na)',
        normalRange: '136-145 mEq/L',
        critical: '<120 or >160 mEq/L',
        units: 'mEq/L',
        clinicalSignificance: 'Fluid balance and nerve function. Hyponatremia can cause confusion, hypernatremia causes thirst.'
      },
      {
        name: 'Potassium (K)',
        normalRange: '3.5-5.0 mEq/L',
        critical: '<2.5 or >6.5 mEq/L',
        units: 'mEq/L',
        clinicalSignificance: 'Heart rhythm and muscle function. Critical for cardiac monitoring.'
      },
      {
        name: 'Chloride (Cl)',
        normalRange: '98-107 mEq/L',
        critical: '<80 or >115 mEq/L',
        units: 'mEq/L',
        clinicalSignificance: 'Acid-base balance and fluid balance.'
      },
      {
        name: 'BUN (Blood Urea Nitrogen)',
        normalRange: '7-20 mg/dL',
        critical: '>100 mg/dL',
        units: 'mg/dL',
        clinicalSignificance: 'Kidney function indicator. Elevated in dehydration, kidney disease, GI bleeding.'
      },
      {
        name: 'Creatinine',
        normalRange: 'Male: 0.7-1.3 mg/dL\nFemale: 0.6-1.1 mg/dL',
        critical: '>4.0 mg/dL',
        units: 'mg/dL',
        clinicalSignificance: 'Kidney function. More reliable than BUN for renal function assessment.'
      }
    ]
  },
  {
    category: 'Liver Function Tests (LFTs)',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    tests: [
      {
        name: 'ALT (Alanine Aminotransferase)',
        normalRange: 'Male: 7-56 U/L\nFemale: 7-40 U/L',
        critical: '>500 U/L',
        units: 'U/L',
        clinicalSignificance: 'Liver enzyme. Elevated in hepatitis, liver damage, drug toxicity.'
      },
      {
        name: 'AST (Aspartate Aminotransferase)',
        normalRange: 'Male: 10-40 U/L\nFemale: 9-32 U/L',
        critical: '>500 U/L',
        units: 'U/L',
        clinicalSignificance: 'Liver and heart enzyme. Elevated in liver disease, MI, muscle damage.'
      },
      {
        name: 'Total Bilirubin',
        normalRange: '0.3-1.2 mg/dL',
        critical: '>5.0 mg/dL',
        units: 'mg/dL',
        clinicalSignificance: 'Liver function and bile flow. Elevated in jaundice, liver disease, hemolysis.'
      },
      {
        name: 'Albumin',
        normalRange: '3.5-5.0 g/dL',
        critical: '<2.0 g/dL',
        units: 'g/dL',
        clinicalSignificance: 'Protein synthesis indicator. Low in liver disease, malnutrition, inflammation.'
      }
    ]
  },
  {
    category: 'Cardiac Markers',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    tests: [
      {
        name: 'Troponin I',
        normalRange: '<0.04 ng/mL',
        critical: '>0.5 ng/mL',
        units: 'ng/mL',
        clinicalSignificance: 'Cardiac muscle damage. Gold standard for MI diagnosis.'
      },
      {
        name: 'CK-MB',
        normalRange: '<5.0 ng/mL',
        critical: '>25 ng/mL',
        units: 'ng/mL',
        clinicalSignificance: 'Cardiac-specific enzyme. Elevated in MI, myocarditis.'
      },
      {
        name: 'BNP (Brain Natriuretic Peptide)',
        normalRange: '<100 pg/mL',
        critical: '>500 pg/mL',
        units: 'pg/mL',
        clinicalSignificance: 'Heart failure marker. Elevated in CHF, fluid overload.'
      }
    ]
  },
  {
    category: 'Coagulation Studies',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    tests: [
      {
        name: 'PT (Prothrombin Time)',
        normalRange: '11-13 seconds',
        critical: '>20 seconds',
        units: 'seconds',
        clinicalSignificance: 'Extrinsic clotting pathway. Monitored for warfarin therapy.'
      },
      {
        name: 'INR (International Normalized Ratio)',
        normalRange: '0.8-1.1',
        critical: '>5.0',
        units: 'ratio',
        clinicalSignificance: 'Standardized PT. Target 2-3 for warfarin therapy.'
      },
      {
        name: 'aPTT (Activated Partial Thromboplastin Time)',
        normalRange: '25-35 seconds',
        critical: '>100 seconds',
        units: 'seconds',
        clinicalSignificance: 'Intrinsic clotting pathway. Monitored for heparin therapy.'
      },
      {
        name: 'D-Dimer',
        normalRange: '<0.5 μg/mL',
        critical: '>2.0 μg/mL',
        units: 'μg/mL',
        clinicalSignificance: 'Fibrin degradation product. Elevated in DVT, PE, DIC.'
      }
    ]
  }
]

export default function LabValuesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTests = labValues.flatMap(category => 
    category.tests.map(test => ({
      ...test,
      category: category.category,
      icon: category.icon,
      color: category.color,
      bgColor: category.bgColor
    }))
  ).filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.clinicalSignificance.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Complete Blood Count', name: 'CBC' },
    { id: 'Basic Metabolic Panel', name: 'BMP' },
    { id: 'Liver Function Tests', name: 'LFTs' },
    { id: 'Cardiac Markers', name: 'Cardiac' },
    { id: 'Coagulation Studies', name: 'Coagulation' }
  ]

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
              <Activity className="w-6 h-6 text-green-600" />
              <span>Lab Values Reference</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Normal ranges and clinical significance of laboratory tests
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
                  placeholder="Search lab tests, values, or clinical significance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lab Values by Category */}
      <div className="space-y-8">
        {labValues
          .filter(category => selectedCategory === 'all' || category.category === selectedCategory)
          .map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                      <Icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <span>{category.category}</span>
                  </CardTitle>
                  <CardDescription>
                    Normal ranges and clinical significance for {category.category.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {category.tests.map((test, index) => (
                      <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {test.name}
                          </h3>
                          <Badge variant="outline">{test.units}</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-success" />
                              <span>Normal Range</span>
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                              {test.normalRange}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-danger" />
                              <span>Critical Values</span>
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                              {test.critical}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Clinical Significance
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {test.clinicalSignificance}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Quick Reference Card */}
      <Card className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span>Critical Values Quick Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Glucose</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Critical: &lt;40 or &gt;400 mg/dL
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Potassium</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Critical: &lt;2.5 or &gt;6.5 mEq/L
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Hemoglobin</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Critical: &lt;7-8 g/dL
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Troponin I</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Critical: &gt;0.5 ng/mL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
