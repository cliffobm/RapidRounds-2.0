import LegacyPractice from '@/components/qbank/LegacyPractice'
import { practiceTopics } from '@/lib/learning/catalog'
import UnifiedPractice from '@/components/learning/UnifiedPractice'
import '../practice.css'
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ bank?: string }>
}) {
  const { bank } = await searchParams
  const initialBank =
    practiceTopics.find((entry) => entry.key === bank)?.key ?? ''
  return initialBank ? (
    <LegacyPractice key={initialBank} initialBank={initialBank} />
  ) : (
    <UnifiedPractice />
  )
}
