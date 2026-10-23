import EcgLibrary from '@/components/learning/EcgLibrary'
import '../ecg.css'

export const metadata = {
  title: 'ECG Rhythm Library | RapidRounds',
  description:
    'Original synthetic ECG teaching strips with rhythm features and patient assessment context.',
}

export default function Page() {
  return <EcgLibrary />
}
