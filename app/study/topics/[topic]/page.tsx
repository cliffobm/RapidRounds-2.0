import { notFound } from 'next/navigation'
import ClinicalStudy from '@/components/learning/ClinicalStudy'
import { materialStudyTopics } from '@/lib/learning/material-study'
export default async function Page({
  params,
}: {
  params: Promise<{ topic: string }>
}) {
  const { topic: id } = await params
  const topic = materialStudyTopics.find((entry) => entry.id === id)
  if (!topic) notFound()
  return <ClinicalStudy topic={topic} />
}
