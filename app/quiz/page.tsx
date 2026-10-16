import LegacyPractice from '@/components/qbank/LegacyPractice'
import { practiceTopics } from '@/lib/learning/catalog'
export default async function Page({ searchParams }: { searchParams: Promise<{ bank?: string }> }) {
  const { bank } = await searchParams
  const initialBank = practiceTopics.find(entry => entry.key === bank)?.key ?? ''
  return <LegacyPractice key={initialBank} initialBank={initialBank} />
}
