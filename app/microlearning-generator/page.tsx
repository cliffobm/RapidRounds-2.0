'use client'

import { useState } from 'react'
import { MicrolearningGenerator, formatAsMarkdown, MicrolearningContent } from '@/lib/microlearning/content-generator'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { AppShell } from '@/components/layout/AppShell'

export default function MicrolearningGeneratorPage() {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('')
  const [generatedContent, setGeneratedContent] = useState<MicrolearningContent | null>(null)
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const categories = [
    'Cardiac',
    'Respiratory', 
    'Neurological',
    'Pediatric',
    'Pharmacology',
    'Emergency',
    'Critical Care',
    'Medical-Surgical'
  ]

  const handleGenerate = async () => {
    if (!topic.trim() || !category.trim()) {
      alert('Please enter both topic and category')
      return
    }

    setIsGenerating(true)
    try {
      const content = MicrolearningGenerator.generateContent(topic, category)
      setGeneratedContent(content)
      const markdown = formatAsMarkdown(content, topic, category)
      setMarkdownOutput(markdown)
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Error generating content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownOutput)
    alert('Markdown copied to clipboard!')
  }

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownOutput], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-microlearning.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-brand-cloud to-white dark:from-brand-ink dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brand-blue dark:text-brand-cloud mb-4">
              Microlearning Content Generator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Create 4-6 minute video scripts, slide outlines, and formative quizzes for nursing education
            </p>
          </div>

          {/* Input Form */}
          <Card className="p-6 mb-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Cardiac Assessment, Stroke Protocol, Medication Administration"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim() || !category.trim()}
                className="w-full md:w-auto"
              >
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>
          </Card>

          {/* Generated Content */}
          {generatedContent && (
            <div className="space-y-8">
              {/* Objectives */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Learning Objectives
                </h2>
                <ol className="list-decimal list-inside space-y-2">
                  {generatedContent.objectives.map((objective, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {objective}
                    </li>
                  ))}
                </ol>
              </Card>

              {/* Video Script */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Video Script ({generatedContent.script.duration})
                </h2>
                <div className="space-y-4">
                  {generatedContent.script.sections.map((section, index) => (
                    <div key={index} className="border-l-4 border-brand-blue pl-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {section.timestamp} - {section.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        {section.content}
                      </p>
                      {section.visualCues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Visual Cues:
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                            {section.visualCues.map((cue, cueIndex) => (
                              <li key={cueIndex}>{cue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Slides */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Slide Outline
                </h2>
                <div className="space-y-4">
                  {generatedContent.slides.map((slide) => (
                    <div key={slide.slideNumber} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Slide {slide.slideNumber}: {slide.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Type: {slide.type}
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {slide.bullets.map((bullet, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quiz */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Formative Quiz
                </h2>
                <div className="space-y-6">
                  {generatedContent.quiz.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Question {index + 1} ({question.type} choice - {question.points} points)
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {question.question}
                      </p>
                      <div className="space-y-2 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center">
                            <span className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{option}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Correct Answer: {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {question.rationale}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* References */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  References
                </h2>
                <ol className="list-decimal list-inside space-y-2">
                  {generatedContent.references.map((ref, index) => (
                    <li key={ref.id} className="text-gray-700 dark:text-gray-300">
                      {ref.authors} ({ref.year}). {ref.title}. <em>{ref.journal}</em>
                      {ref.doi && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {' '}https://doi.org/{ref.doi}
                        </span>
                      )}
                      {ref.url && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {' '}{ref.url}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </Card>

              {/* Export Options */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Export Content
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleCopyMarkdown} variant="outline">
                    Copy Markdown
                  </Button>
                  <Button onClick={handleDownloadMarkdown} variant="outline">
                    Download Markdown
                  </Button>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Markdown Output (Preview)
                  </label>
                  <textarea
                    value={markdownOutput}
                    readOnly
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                  />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
