'use client'
import { useId, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { X } from 'lucide-react'
import Link from 'next/link'
import {
  referenceParts,
  getInlineReference,
  type InlineReference,
} from '@/lib/learning/inline-references'
import { contentSources } from '@/lib/learning/sources'

export function ReferenceCard({
  reference,
  children,
  onLookup,
  label,
}: {
  reference: InlineReference
  children: string
  onLookup?: (() => void) | undefined
  label?: string
}) {
  const titleId = useId()
  const descriptionId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const [container, setContainer] = useState<HTMLElement | undefined>()
  const entry = getInlineReference(reference)
  if (!entry) return children
  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (open) {
          setContainer(
            trigger.current?.closest<HTMLElement>('.rr-app') ?? undefined
          )
          onLookup?.()
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          className="inline-reference-trigger"
          aria-label={`Reference: ${label ?? children}`}
        >
          {children}
        </button>
      </Popover.Trigger>
      <Popover.Portal container={container}>
        <Popover.Content
          className="inline-reference-card"
          sideOffset={8}
          collisionPadding={16}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <div className="inline-reference-heading">
            <h3 id={titleId}>{entry.title}</h3>
            <Popover.Close
              className="inline-reference-close"
              aria-label="Close reference"
              type="button"
            >
              <X size={18} aria-hidden="true" />
            </Popover.Close>
          </div>
          {entry.kind === 'value' && (
            <p className="inline-reference-example">{entry.example}</p>
          )}
          <p id={descriptionId}>{entry.definition}</p>
          {entry.kind === 'value' && (
            <p className="inline-reference-limit">
              Educational adult example, not a patient-specific target or
              critical-value threshold.
            </p>
          )}
          <p className="inline-reference-limit">
            Educational draft · Human clinical review pending.
          </p>
          <a
            href={contentSources[entry.source].url}
            target="_blank"
            rel="noreferrer"
          >
            Source: {contentSources[entry.source].title} ↗
          </a>
          <Link href={entry.href} target="_blank" rel="noreferrer">
            Read more in the glossary ↗
          </Link>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
export default function InlineReferenceText({
  text,
  onLookup,
}: {
  text: string
  onLookup?: (() => void) | undefined
}) {
  return (
    <>
      {referenceParts(text).map((part, index) =>
        part.reference ? (
          <ReferenceCard
            key={`${part.reference.kind}:${part.reference.id}:${index}`}
            reference={part.reference}
            onLookup={onLookup}
          >
            {part.text}
          </ReferenceCard>
        ) : (
          part.text
        )
      )}
    </>
  )
}
