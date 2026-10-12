import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScenarioCard, ScenarioData } from './ScenarioCard'

const mockScenario: ScenarioData = {
  id: 'test-scenario',
  title: 'Test Cardiac Scenario',
  setting: 'Emergency Department',
  chiefComplaint: 'Chest pain for 2 hours',
  presentingSymptoms: ['Chest pain', 'Shortness of breath', 'Nausea'],
  history: 'Patient reports crushing chest pain',
  patientInfo: {
    name: 'John Doe',
    age: 58,
    gender: 'male',
    allergies: ['Penicillin'],
    medications: ['Lisinopril 10mg daily'],
    medicalHistory: ['Hypertension', 'Diabetes']
  },
  vitalSigns: {
    heartRate: 110,
    bloodPressure: { systolic: 160, diastolic: 95 },
    temperature: 98.6,
    respiratoryRate: 22,
    oxygenSaturation: 94,
    painLevel: 8
  },
  labResults: {
    'Troponin I': { value: 2.5, unit: 'ng/mL', normal: false, critical: true }
  },
  urgency: 'critical'
}

describe('ScenarioCard', () => {
  it('renders patient information correctly', () => {
    render(<ScenarioCard scenario={mockScenario} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('58 year old male')).toBeInTheDocument()
    expect(screen.getByText('Emergency Department')).toBeInTheDocument()
    expect(screen.getByText('Chest pain for 2 hours')).toBeInTheDocument()
  })

  it('displays vital signs with proper formatting', () => {
    render(<ScenarioCard scenario={mockScenario} />)
    
    expect(screen.getByText('110')).toBeInTheDocument() // Heart rate
    expect(screen.getByText('160/95')).toBeInTheDocument() // Blood pressure
    expect(screen.getByText('98.6°F')).toBeInTheDocument() // Temperature
    expect(screen.getByText('22')).toBeInTheDocument() // Respiratory rate
    expect(screen.getByText('94%')).toBeInTheDocument() // O2 saturation
    expect(screen.getByText('8/10')).toBeInTheDocument() // Pain level
  })

  it('shows presenting symptoms as badges', () => {
    render(<ScenarioCard scenario={mockScenario} />)
    
    expect(screen.getByText('Chest pain')).toBeInTheDocument()
    expect(screen.getByText('Shortness of breath')).toBeInTheDocument()
    expect(screen.getByText('Nausea')).toBeInTheDocument()
  })

  it('displays urgency level correctly', () => {
    render(<ScenarioCard scenario={mockScenario} />)
    
    expect(screen.getByText('critical')).toBeInTheDocument()
  })

  it('shows lab results with critical indicators', () => {
    render(<ScenarioCard scenario={mockScenario} />)
    
    expect(screen.getByText('Troponin I')).toBeInTheDocument()
    expect(screen.getByText('2.5 ng/mL')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('displays medical history and medications', () => {
    render(<ScenarioCard scenario={mockScenario} />)
    
    expect(screen.getByText(/Hypertension/)).toBeInTheDocument()
    expect(screen.getByText(/Diabetes/)).toBeInTheDocument()
    expect(screen.getByText(/Lisinopril 10mg daily/)).toBeInTheDocument()
    expect(screen.getByText(/Penicillin/)).toBeInTheDocument()
  })

  it('handles empty lab results gracefully', () => {
    const scenarioWithoutLabs = { ...mockScenario, labResults: undefined }
    
    render(<ScenarioCard scenario={scenarioWithoutLabs as any} />)
    
    // Should not crash and should still show other content
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('handles empty medical history gracefully', () => {
    const scenarioWithoutHistory = {
      ...mockScenario,
      patientInfo: {
        ...mockScenario.patientInfo,
        medicalHistory: [],
        medications: []
      }
    }
    
    render(<ScenarioCard scenario={scenarioWithoutHistory} />)
    
    expect(screen.getByText('No significant medical history')).toBeInTheDocument()
    expect(screen.getByText('No current medications')).toBeInTheDocument()
  })
})



