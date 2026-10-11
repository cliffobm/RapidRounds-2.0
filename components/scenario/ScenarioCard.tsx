'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets,
  Clock,
  User,
  MapPin,
  AlertTriangle
} from 'lucide-react'

export interface PatientInfo {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  allergies: string[]
  medications: string[]
  medicalHistory: string[]
}

export interface VitalSigns {
  heartRate: number
  bloodPressure: {
    systolic: number
    diastolic: number
  }
  temperature: number
  respiratoryRate: number
  oxygenSaturation: number
  painLevel: number
}

export interface LabResults {
  [key: string]: {
    value: string | number
    unit: string
    normal: boolean
    critical?: boolean
  }
}

export interface ScenarioData {
  id: string
  title: string
  setting: string
  chiefComplaint: string
  presentingSymptoms: string[]
  history: string
  patientInfo: PatientInfo
  vitalSigns: VitalSigns
  labResults?: LabResults
  clinicalNotes?: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

interface ScenarioCardProps {
  scenario: ScenarioData
  className?: string
}

export function ScenarioCard({ scenario, className = '' }: ScenarioCardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const getVitalStatus = (vital: string, value: number) => {
    // Basic vital sign ranges (simplified for demo)
    const ranges = {
      heartRate: { low: 60, high: 100 },
      systolic: { low: 90, high: 140 },
      diastolic: { low: 60, high: 90 },
      temperature: { low: 97, high: 99.5 },
      respiratoryRate: { low: 12, high: 20 },
      oxygenSaturation: { low: 95, high: 100 },
    }

    const range = ranges[vital as keyof typeof ranges]
    if (!range) return 'normal'
    
    if (value < range.low) return 'low'
    if (value > range.high) return 'high'
    return 'normal'
  }

  const getVitalColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-blue-600'
      case 'high': return 'text-red-600'
      case 'critical': return 'text-red-700 font-bold'
      default: return 'text-slate-700'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header with urgency */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {scenario.patientInfo.name}
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-800">
              {scenario.patientInfo.age} year old {scenario.patientInfo.gender}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getUrgencyColor(scenario.urgency)}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {scenario.urgency}
          </Badge>
        </div>
      </div>

      {/* Setting and Chief Complaint */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-900">
              {scenario.setting}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-900 mb-1">
                Chief Complaint
              </h4>
              <p className="text-sm text-slate-900 dark:text-slate-900">
                {scenario.chiefComplaint}
              </p>
            </div>
            
            {scenario.presentingSymptoms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-900 mb-2">
                  Presenting Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {scenario.presentingSymptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Vital Signs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg mx-auto mb-2">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <p className={`text-lg font-semibold ${getVitalColor(getVitalStatus('heartRate', scenario.vitalSigns.heartRate))}`}>
                {scenario.vitalSigns.heartRate}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-800">HR (bpm)</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mx-auto mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <p className={`text-lg font-semibold ${getVitalColor(getVitalStatus('systolic', scenario.vitalSigns.bloodPressure.systolic))}`}>
                {scenario.vitalSigns.bloodPressure.systolic}/{scenario.vitalSigns.bloodPressure.diastolic}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-800">BP (mmHg)</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-lg mx-auto mb-2">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <p className={`text-lg font-semibold ${getVitalColor(getVitalStatus('temperature', scenario.vitalSigns.temperature))}`}>
                {scenario.vitalSigns.temperature}°F
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-800">Temp</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg mx-auto mb-2">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <p className={`text-lg font-semibold ${getVitalColor(getVitalStatus('respiratoryRate', scenario.vitalSigns.respiratoryRate))}`}>
                {scenario.vitalSigns.respiratoryRate}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-800">RR (/min)</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-cyan-50 rounded-lg mx-auto mb-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
              <p className={`text-lg font-semibold ${getVitalColor(getVitalStatus('oxygenSaturation', scenario.vitalSigns.oxygenSaturation))}`}>
                {scenario.vitalSigns.oxygenSaturation}%
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-800">O2 Sat</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg mx-auto mb-2">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
              </div>
              <p className={`text-lg font-semibold ${scenario.vitalSigns.painLevel > 7 ? 'text-red-600' : scenario.vitalSigns.painLevel > 4 ? 'text-orange-600' : 'text-green-600'}`}>
                {scenario.vitalSigns.painLevel}/10
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-800">Pain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient History & Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Medical History</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {scenario.patientInfo.medicalHistory.length > 0 ? (
              <ul className="space-y-1">
                {scenario.patientInfo.medicalHistory.map((condition, index) => (
                  <li key={index} className="text-sm text-slate-900 dark:text-slate-900">
                    • {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-800">No significant medical history</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Medications</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {scenario.patientInfo.medications.length > 0 ? (
              <ul className="space-y-1">
                {scenario.patientInfo.medications.map((medication, index) => (
                  <li key={index} className="text-sm text-slate-900 dark:text-slate-900">
                    • {medication}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-800">No current medications</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lab Results (if available) */}
      {scenario.labResults && Object.keys(scenario.labResults).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Lab Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(scenario.labResults).map(([test, result]) => (
                <div key={test} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-900">
                    {test}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      result.critical ? 'text-red-600' : 
                      !result.normal ? 'text-orange-600' : 
                      'text-slate-900 dark:text-slate-900'
                    }`}>
                      {result.value} {result.unit}
                    </span>
                    {result.critical && (
                      <Badge variant="danger" size="sm">Critical</Badge>
                    )}
                    {!result.normal && !result.critical && (
                      <Badge variant="warning" size="sm">Abnormal</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Notes */}
      {scenario.clinicalNotes && scenario.clinicalNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Clinical Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {scenario.clinicalNotes.map((note, index) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-900 dark:text-slate-900">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}



