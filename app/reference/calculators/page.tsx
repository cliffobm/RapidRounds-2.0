'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  Calculator, 
  ArrowLeft,
  Droplets,
  Heart,
  Weight,
  Activity,
  Clock,
  Pill
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const calculators = [
  {
    id: 'iv-drip-rate',
    title: 'IV Drip Rate Calculator',
    description: 'Calculate IV drip rates and infusion times',
    icon: Droplets,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'IV Therapy'
  },
  {
    id: 'dosage',
    title: 'Dosage Calculator',
    description: 'Calculate medication dosages based on weight and indication',
    icon: Pill,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'Medications'
  },
  {
    id: 'bmi',
    title: 'BMI Calculator',
    description: 'Calculate Body Mass Index and interpret results',
    icon: Weight,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'Assessment'
  },
  {
    id: 'cardiac-output',
    title: 'Cardiac Output Calculator',
    description: 'Calculate cardiac output using various methods',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    category: 'Cardiac'
  }
]

export default function CalculatorsPage() {
  const router = useRouter()
  const [selectedCalculator, setSelectedCalculator] = useState<any>(null)
  const [results, setResults] = useState<any>({})

  // IV Drip Rate Calculator Component
  const IVDripCalculator = () => {
    const [volume, setVolume] = useState('')
    const [time, setTime] = useState('')
    const [dropFactor, setDropFactor] = useState('15')
    const [result, setResult] = useState<any>(null)

    const calculate = () => {
      const vol = parseFloat(volume)
      const hrs = parseFloat(time)
      const factor = parseFloat(dropFactor)

      if (vol && hrs && factor) {
        const mlPerHour = vol / hrs
        const dropsPerMinute = (vol * factor) / (hrs * 60)
        
        setResult({
          mlPerHour: Math.round(mlPerHour * 100) / 100,
          dropsPerMinute: Math.round(dropsPerMinute * 100) / 100,
          totalTime: hrs
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="volume">Total Volume (mL)</Label>
            <Input
              id="volume"
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="1000"
            />
          </div>
          <div>
            <Label htmlFor="time">Time (hours)</Label>
            <Input
              id="time"
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="8"
            />
          </div>
          <div>
            <Label htmlFor="dropFactor">Drop Factor (gtts/mL)</Label>
            <select 
              id="dropFactor"
              value={dropFactor}
              onChange={(e) => setDropFactor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="10">10 gtts/mL (Blood set)</option>
              <option value="15">15 gtts/mL (Standard)</option>
              <option value="20">20 gtts/mL (Pediatric)</option>
              <option value="60">60 gtts/mL (Micro-drip)</option>
            </select>
          </div>
        </div>

        <Button onClick={calculate} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Drip Rate
        </Button>

        {result && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Calculation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-600">Flow Rate</p>
                  <p className="text-2xl font-bold text-green-800">{result.mlPerHour} mL/hr</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Drip Rate</p>
                  <p className="text-2xl font-bold text-green-800">{result.dropsPerMinute} gtts/min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Dosage Calculator Component
  const DosageCalculator = () => {
    const [weight, setWeight] = useState('')
    const [dose, setDose] = useState('')
    const [concentration, setConcentration] = useState('')
    const [result, setResult] = useState<any>(null)

    const calculate = () => {
      const wt = parseFloat(weight)
      const dosePerKg = parseFloat(dose)
      const conc = parseFloat(concentration)

      if (wt && dosePerKg && conc) {
        const totalDose = wt * dosePerKg
        const volumeNeeded = totalDose / conc
        
        setResult({
          totalDose: Math.round(totalDose * 100) / 100,
          volumeNeeded: Math.round(volumeNeeded * 100) / 100
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="weight">Patient Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </div>
          <div>
            <Label htmlFor="dose">Dose (mg/kg)</Label>
            <Input
              id="dose"
              type="number"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <Label htmlFor="concentration">Concentration (mg/mL)</Label>
            <Input
              id="concentration"
              type="number"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Dosage
        </Button>

        {result && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Calculation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Total Dose</p>
                  <p className="text-2xl font-bold text-blue-800">{result.totalDose} mg</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Volume to Administer</p>
                  <p className="text-2xl font-bold text-blue-800">{result.volumeNeeded} mL</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // BMI Calculator Component
  const BMICalculator = () => {
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [result, setResult] = useState<any>(null)

    const calculate = () => {
      const h = parseFloat(height) / 100 // convert cm to meters
      const w = parseFloat(weight)

      if (h && w) {
        const bmi = w / (h * h)
        let category = ''
        let color = ''

        if (bmi < 18.5) {
          category = 'Underweight'
          color = 'text-blue-600'
        } else if (bmi < 25) {
          category = 'Normal weight'
          color = 'text-green-600'
        } else if (bmi < 30) {
          category = 'Overweight'
          color = 'text-yellow-600'
        } else {
          category = 'Obese'
          color = 'text-red-600'
        }
        
        setResult({
          bmi: Math.round(bmi * 10) / 10,
          category,
          color
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate BMI
        </Button>

        {result && (
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">BMI Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-800 mb-2">{result.bmi}</p>
                <p className={`text-lg font-semibold ${result.color}`}>{result.category}</p>
                <div className="mt-4 text-sm text-slate-600">
                  <p>BMI Categories:</p>
                  <p>• Underweight: &lt; 18.5</p>
                  <p>• Normal: 18.5 - 24.9</p>
                  <p>• Overweight: 25 - 29.9</p>
                  <p>• Obese: ≥ 30</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderCalculator = () => {
    switch (selectedCalculator?.id) {
      case 'iv-drip-rate':
        return <IVDripCalculator />
      case 'dosage':
        return <DosageCalculator />
      case 'bmi':
        return <BMICalculator />
      case 'cardiac-output':
        return (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-slate-600">Cardiac Output Calculator coming soon!</p>
          </div>
        )
      default:
        return null
    }
  }

  if (selectedCalculator) {
    const Icon = selectedCalculator.icon
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline"
            onClick={() => setSelectedCalculator(null)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Calculators</span>
          </Button>
        </div>

        {/* Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className={`p-3 rounded-2xl ${selectedCalculator.bgColor}`}>
                <Icon className={`w-6 h-6 ${selectedCalculator.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{selectedCalculator.title}</h1>
                <p className="text-slate-600">{selectedCalculator.description}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCalculator()}
          </CardContent>
        </Card>

        {/* Safety Notice */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> These calculations are for educational purposes only. 
              Always verify calculations independently and follow institutional protocols. 
              Consult with pharmacists and physicians for complex dosing decisions.
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
              <Calculator className="w-6 h-6 text-purple-600" />
              <span>Medical Calculators</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Essential calculation tools for clinical practice
            </p>
          </div>
        </div>
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {calculators.map((calculator) => {
          const Icon = calculator.icon
          return (
            <Card 
              key={calculator.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedCalculator(calculator)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${calculator.bgColor}`}>
                    <Icon className={`w-6 h-6 ${calculator.color}`} />
                  </div>
                  <Badge variant="outline">
                    {calculator.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {calculator.title}
                </CardTitle>
                <CardDescription>
                  {calculator.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Educational Note */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Clinical Calculation Best Practices</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Always double-check calculations with a colleague</li>
            <li>• Use institutional calculation tools when available</li>
            <li>• Verify units of measurement carefully</li>
            <li>• Consider patient-specific factors (age, kidney function, etc.)</li>
            <li>• When in doubt, consult pharmacy or physician</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}


