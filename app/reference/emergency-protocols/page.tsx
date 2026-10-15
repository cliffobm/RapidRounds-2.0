'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  AlertTriangle, 
  Heart, 
  Brain,
  Shield,
  Zap,
  ArrowLeft,
  Clock,
  Users,
  Activity
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Emergency protocols based on 2024 guidelines
const emergencyProtocols = [
  {
    id: 'cardiac-arrest',
    title: 'Cardiac Arrest',
    category: 'Cardiac Emergency',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    priority: 'Critical',
    estimatedTime: 'Immediate',
    steps: [
      {
        step: 1,
        action: 'Assess responsiveness and breathing',
        details: 'Check for pulse, breathing, and consciousness. If unresponsive, call for help immediately.',
        time: '0-10 seconds'
      },
      {
        step: 2,
        action: 'Activate emergency response',
        details: 'Call code blue, get crash cart, assign roles to team members.',
        time: '10-30 seconds'
      },
      {
        step: 3,
        action: 'Begin high-quality CPR',
        details: '30 compressions to 2 breaths, rate 100-120/min, depth 2-2.4 inches.',
        time: '30 seconds - 2 minutes'
      },
      {
        step: 4,
        action: 'Apply AED/defibrillator',
        details: 'Turn on AED, apply pads, analyze rhythm, shock if indicated.',
        time: '2-3 minutes'
      },
      {
        step: 5,
        action: 'Administer medications',
        details: 'Epinephrine 1mg IV/IO q3-5min, amiodarone for refractory VF/VT.',
        time: '3-5 minutes'
      },
      {
        step: 6,
        action: 'Continue resuscitation',
        details: 'Continue CPR, reassess rhythm every 2 minutes, consider reversible causes.',
        time: 'Ongoing'
      }
    ],
    medications: [
      { name: 'Epinephrine', dose: '1mg IV/IO', frequency: 'q3-5min', indication: 'All rhythms' },
      { name: 'Amiodarone', dose: '300mg IV/IO', frequency: 'First dose', indication: 'VF/VT refractory to shock' },
      { name: 'Lidocaine', dose: '1-1.5mg/kg IV/IO', frequency: 'q5-10min', indication: 'Alternative to amiodarone' }
    ],
    monitoring: ['ECG rhythm', 'Pulse check', 'Blood pressure', 'Oxygen saturation', 'End-tidal CO2'],
    notes: 'Focus on high-quality CPR with minimal interruptions. Consider reversible causes (H\'s and T\'s).'
  },
  {
    id: 'stroke',
    title: 'Acute Stroke',
    category: 'Neurological Emergency',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    priority: 'Critical',
    estimatedTime: 'Immediate',
    steps: [
      {
        step: 1,
        action: 'Assess using FAST criteria',
        details: 'Face drooping, Arm weakness, Speech difficulty, Time to call 911.',
        time: '0-1 minute'
      },
      {
        step: 2,
        action: 'Activate stroke team',
        details: 'Call stroke alert, notify neurologist, prepare for rapid assessment.',
        time: '1-2 minutes'
      },
      {
        step: 3,
        action: 'Obtain vital signs and history',
        details: 'BP, HR, temp, last known normal time, medications, allergies.',
        time: '2-3 minutes'
      },
      {
        step: 4,
        action: 'Perform neurological assessment',
        details: 'NIH Stroke Scale, GCS, pupil response, motor function.',
        time: '3-5 minutes'
      },
      {
        step: 5,
        action: 'Obtain CT scan',
        details: 'Non-contrast CT head within 25 minutes of arrival.',
        time: '5-25 minutes'
      },
      {
        step: 6,
        action: 'Administer tPA if indicated',
        details: 'If within 3-4.5 hours and no contraindications, give tPA.',
        time: '25-60 minutes'
      }
    ],
    medications: [
      { name: 'tPA (Alteplase)', dose: '0.9mg/kg', frequency: 'Single dose', indication: 'Ischemic stroke within 3-4.5 hours' },
      { name: 'Aspirin', dose: '325mg', frequency: 'Daily', indication: 'After tPA or if no tPA given' }
    ],
    monitoring: ['Neurological status', 'Blood pressure', 'Vital signs', 'Bleeding assessment'],
    notes: 'Time is brain! Every minute counts. Document last known normal time precisely.'
  },
  {
    id: 'sepsis',
    title: 'Sepsis/Septic Shock',
    category: 'Infectious Emergency',
    icon: Shield,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    priority: 'Critical',
    estimatedTime: '1 hour',
    steps: [
      {
        step: 1,
        action: 'Recognize sepsis',
        details: 'SIRS criteria + suspected infection, or qSOFA score ≥2.',
        time: '0-5 minutes'
      },
      {
        step: 2,
        action: 'Obtain blood cultures',
        details: 'Two sets from different sites before antibiotics if possible.',
        time: '5-10 minutes'
      },
      {
        step: 3,
        action: 'Administer broad-spectrum antibiotics',
        details: 'Within 1 hour of recognition, based on suspected source.',
        time: '10-60 minutes'
      },
      {
        step: 4,
        action: 'Fluid resuscitation',
        details: '30ml/kg crystalloid if hypotensive or lactate ≥4.',
        time: '30-60 minutes'
      },
      {
        step: 5,
        action: 'Vasopressor support',
        details: 'Norepinephrine if MAP <65 after fluid resuscitation.',
        time: '60-90 minutes'
      },
      {
        step: 6,
        action: 'Source control',
        details: 'Identify and treat source of infection (drainage, debridement).',
        time: '6-12 hours'
      }
    ],
    medications: [
      { name: 'Norepinephrine', dose: '0.1-2.0 mcg/kg/min', frequency: 'Continuous', indication: 'First-line vasopressor' },
      { name: 'Vasopressin', dose: '0.03 units/min', frequency: 'Continuous', indication: 'Second-line vasopressor' },
      { name: 'Broad-spectrum antibiotics', dose: 'Varies', frequency: 'Per protocol', indication: 'Suspected infection' }
    ],
    monitoring: ['MAP', 'Lactate', 'Urine output', 'Vital signs', 'Mental status'],
    notes: 'Sepsis bundle: cultures, antibiotics, lactate, fluids, vasopressors. Monitor lactate clearance.'
  },
  {
    id: 'anaphylaxis',
    title: 'Anaphylaxis',
    category: 'Allergic Emergency',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    priority: 'Critical',
    estimatedTime: 'Immediate',
    steps: [
      {
        step: 1,
        action: 'Recognize anaphylaxis',
        details: 'Acute onset with skin/mucosal involvement + respiratory compromise or hypotension.',
        time: '0-1 minute'
      },
      {
        step: 2,
        action: 'Remove allergen if possible',
        details: 'Stop medication, remove stinger, etc.',
        time: '1-2 minutes'
      },
      {
        step: 3,
        action: 'Administer epinephrine',
        details: '0.3-0.5mg IM in thigh, may repeat q5-15min.',
        time: '2-3 minutes'
      },
      {
        step: 4,
        action: 'Position patient',
        details: 'Supine with legs elevated if hypotensive.',
        time: '3-4 minutes'
      },
      {
        step: 5,
        action: 'Supportive medications',
        details: 'Antihistamines, corticosteroids, bronchodilators as needed.',
        time: '5-10 minutes'
      },
      {
        step: 6,
        action: 'Monitor and reassess',
        details: 'Continuous monitoring for biphasic reaction.',
        time: 'Ongoing'
      }
    ],
    medications: [
      { name: 'Epinephrine', dose: '0.3-0.5mg IM', frequency: 'q5-15min', indication: 'First-line treatment' },
      { name: 'Diphenhydramine', dose: '25-50mg IV/IM', frequency: 'q6h', indication: 'H1 blocker' },
      { name: 'Methylprednisolone', dose: '125mg IV', frequency: 'q6h', indication: 'Prevent biphasic reaction' }
    ],
    monitoring: ['Airway', 'Breathing', 'Circulation', 'Skin changes', 'Mental status'],
    notes: 'Epinephrine is the drug of choice. Monitor for biphasic reaction for 4-6 hours.'
  }
]

export default function EmergencyProtocolsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null)

  const filteredProtocols = emergencyProtocols.filter(protocol =>
    protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    protocol.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    protocol.steps.some(step => step.action.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (selectedProtocol) {
    const Icon = selectedProtocol.icon
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline"
            onClick={() => setSelectedProtocol(null)}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Protocols</span>
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${selectedProtocol.bgColor}`}>
              <Icon className={`w-6 h-6 ${selectedProtocol.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedProtocol.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedProtocol.category} • {selectedProtocol.priority} Priority
              </p>
            </div>
          </div>
        </div>

        {/* Protocol Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Emergency Protocol Steps</span>
            </CardTitle>
            <CardDescription>
              Follow these steps in order for optimal patient outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedProtocol.steps.map((step: any, index: number) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {step.action}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      {step.details}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{step.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Medications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                  {selectedProtocol.medications.map((med: any, index: number) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {med.name}
                    </h4>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p><strong>Dose:</strong> {med.dose}</p>
                      <p><strong>Frequency:</strong> {med.frequency}</p>
                      <p><strong>Indication:</strong> {med.indication}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Monitoring Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                  {selectedProtocol.monitoring.map((param: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-400">{param}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Notes */}
        <Card className="mt-6 bg-gradient-to-r from-warning/5 to-danger/5 border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span>Important Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-900 dark:text-slate-100 font-medium">
              {selectedProtocol.notes}
            </p>
          </CardContent>
        </Card>
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
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span>Emergency Protocols</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Critical care protocols and emergency response procedures
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search emergency protocols, conditions, or procedures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProtocols.map((protocol) => {
          const Icon = protocol.icon
          return (
            <Card 
              key={protocol.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedProtocol(protocol)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${protocol.bgColor}`}>
                    <Icon className={`w-6 h-6 ${protocol.color}`} />
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant="danger">{protocol.priority}</Badge>
                    <Badge variant="outline">{protocol.estimatedTime}</Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{protocol.title}</CardTitle>
                <CardDescription>{protocol.category}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                      Key Steps ({protocol.steps.length})
                    </h4>
                    <div className="space-y-1">
                      {protocol.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {step.step}
                          </div>
                          <span className="text-slate-600 dark:text-slate-400">{step.action}</span>
                        </div>
                      ))}
                      {protocol.steps.length > 3 && (
                        <p className="text-xs text-slate-500 ml-6">
                          +{protocol.steps.length - 3} more steps
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{protocol.estimatedTime}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); setSelectedProtocol(protocol) }}>View Protocol
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProtocols.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No protocols found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search terms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
