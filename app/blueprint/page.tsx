import Link from 'next/link'
import {
  rapidRounds,
  rapidRoundBlueprint,
  roundCategories,
  roundSkills,
  rapidRoundRevision,
} from '@/lib/learning/rapid-rounds'
export default function Page() {
  const blueprint = rapidRoundBlueprint()
  return (
    <div className="rr-experience round-blueprint">
      <Link className="text-link" href="/rapid-rounds">
        ← Rapid Rounds
      </Link>
      <p className="eyebrow">THE PURPOSE BEHIND THE PRACTICE</p>
      <h1>A clearer learning blueprint.</h1>
      <p>
        This pilot is designed for newly licensed nurses practising adult
        acute-care reasoning. Ten patient encounters contain 40 prompts. Each
        prompt has one primary content category and one dominant cognitive
        demand. The six prerequisite checks are recorded separately from the 34
        clinical judgment decisions.
      </p>
      <h2>Content coverage</h2>
      <div className="blueprint-table-wrap">
        <table>
          <caption>
            Current pilot coverage · revision {rapidRoundRevision}
          </caption>
          <thead>
            <tr>
              <th scope="col">Content category</th>
              <th scope="col">Planned prompts</th>
              <th scope="col">Included prompts</th>
            </tr>
          </thead>
          <tbody>
            {blueprint.categories.map((c) => (
              <tr key={c.id}>
                <th scope="row">{c.title}</th>
                <td>{c.target}</td>
                <td>{c.actual}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Total</th>
              <td>40</td>
              <td>{blueprint.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2>What the prompts ask you to do</h2>
      <p>
        {blueprint.cognition.map((c) => `${c.actual} ${c.id}`).join(' · ')}.
        Application and analysis account for 34 of 40 prompts (85%). These are
        planned cognitive demands, not calibrated difficulty estimates.
      </p>
      <p>
        {blueprint.formats.choice} single-best-answer prompts and{' '}
        {blueprint.formats.matrix} four-row classification prompts. Every
        classification row is explained in the debrief; a four-row prompt counts
        once in the blueprint.
      </p>
      <h2>Clinical judgment coverage</h2>
      <ul>
        {blueprint.skills.map((s) => (
          <li key={s.id}>
            {s.title}: {s.actual} primary decision prompts
          </li>
        ))}
      </ul>
      <p>
        Bloom’s level describes cognitive demand; a judgment label describes the
        decision process sampled. These are separate classifications. Warm-ups
        support knowledge and carry no primary judgment label.
      </p>
      <h2>Outcomes by encounter</h2>
      {rapidRounds.map((r) => (
        <details key={r.id}>
          <summary>{r.title}</summary>
          <p>{r.focus}</p>
          <Link className="text-link" href={`/rapid-rounds?case=${r.id}`}>
            Open this encounter →
          </Link>
          <ol>
            {r.steps.map((s) => (
              <li key={s.id}>
                <strong>{s.outcome}</strong>
                <p>
                  {roundCategories[s.category].title} · {s.bloom} ·{' '}
                  {s.skill ? roundSkills[s.skill] : 'Prerequisite knowledge'} ·{' '}
                  {s.format === 'choice'
                    ? 'Single best answer'
                    : 'Four-row classification'}
                </p>
              </li>
            ))}
          </ol>
        </details>
      ))}
      <h2>How this pilot will improve</h2>
      <p>
        Tester flags and suggestions are linked to the exact item revision.
        Clinical and item-writing review should examine the stated outcome,
        answer justification, alternatives, accessibility and interpretation of
        the response data. A blueprint specifies coverage; it does not establish
        reliability or transfer on its own.
      </p>
      <p>
        The development blueprint adapts the categories and cognitive balance in
        the supplied NR723 Week 4 assessment-design paper to formative practice
        for newly licensed nurses. Optional clue construction is an adaptation
        of scenario-writing principles, not a replication of the research
        intervention.
      </p>
      <p>
        <a
          href="https://link.springer.com/article/10.1186/s12909-025-07079-w"
          target="_blank"
          rel="noreferrer"
        >
          Research on gamified scenario writing
        </a>{' '}
        ·{' '}
        <a
          href="https://www.nclex.com/clinical-judgment-measurement-model.page"
          target="_blank"
          rel="noreferrer"
        >
          NCSBN framework reference
        </a>
      </p>
    </div>
  )
}
