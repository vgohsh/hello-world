import { useState } from 'react'
import type { QuizQuestion } from '../../types/lesson'
import { useProgress } from '../../hooks/useProgress'
import { tokenize } from '../../lib/scoring'

const PASS_MARK = 3

function isCorrect(q: QuizQuestion, answer: string | number | undefined): boolean {
  if (answer === undefined) return false
  if (q.type === 'multiple-choice') return answer === q.answerIndex
  const given = tokenize(String(answer)).join(' ')
  return q.answers.some((a) => tokenize(a).join(' ') === given)
}

export default function QuizTab({ lessonId, questions }: { lessonId: number; questions: QuizQuestion[] }) {
  const { recordQuiz, completeLesson, progress } = useProgress()
  const [answers, setAnswers] = useState<Record<number, string | number>>({})
  const [submitted, setSubmitted] = useState(false)
  const score = questions.filter((q, i) => isCorrect(q, answers[i])).length
  const best = progress.quizScores[lessonId]

  const submit = () => {
    setSubmitted(true)
    recordQuiz(lessonId, score)
    if (score >= PASS_MARK) completeLesson(lessonId)
  }

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="h-serif text-2xl">Check your understanding</h2>
          <p className="text-sm text-muted">Score {PASS_MARK}/{questions.length} or more to complete the lesson.</p>
        </div>
        {best !== undefined && <p className="text-sm text-muted">Best score: {best}/{questions.length}</p>}
      </div>

      <ol className="space-y-4">
        {questions.map((q, i) => {
          const correct = submitted && isCorrect(q, answers[i])
          const wrong = submitted && !correct
          return (
            <li key={i} className={`card !p-4 ${correct ? '!border-good' : wrong ? '!border-bad' : ''}`}>
              <fieldset>
                <legend className="font-medium">
                  <span className="mr-2 text-gold">{i + 1}.</span>
                  {q.type === 'fill-blank' ? 'Fill in the blank: ' : ''}
                  {q.question}
                </legend>
                {q.type === 'multiple-choice' ? (
                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt, j) => {
                      const chosen = answers[i] === j
                      const showRight = submitted && j === q.answerIndex
                      return (
                        <label
                          key={j}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                            showRight ? 'border-good bg-good/10' : chosen ? 'border-gold bg-gold-soft' : 'border-line hover:border-gold'
                          } ${submitted ? 'cursor-default' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            className="accent-[var(--gold)]"
                            checked={chosen}
                            disabled={submitted}
                            onChange={() => setAnswers((a) => ({ ...a, [i]: j }))}
                          />
                          {opt}
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    aria-label={`Answer for question ${i + 1}`}
                    className="mt-3 w-full max-w-xs rounded-xl border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-gold"
                    value={(answers[i] as string) ?? ''}
                    disabled={submitted}
                    onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                    autoComplete="off"
                    autoCapitalize="off"
                  />
                )}
                {submitted && (
                  <p className={`mt-3 text-sm ${correct ? 'text-good' : 'text-bad'}`} role="status">
                    {correct ? '✓ Correct. ' : `✗ ${q.type === 'fill-blank' ? `Answer: "${q.answers[0]}". ` : ''}`}
                    <span className="text-muted">{q.explanation}</span>
                  </p>
                )}
              </fieldset>
            </li>
          )
        })}
      </ol>

      {submitted ? (
        <div className="card flex flex-wrap items-center justify-between gap-3" role="status">
          <p className="h-serif text-2xl">
            You scored {score}/{questions.length}. {score >= PASS_MARK ? 'Lesson complete! 🎉' : 'Review the lesson and try again.'}
          </p>
          <button type="button" className="btn-ghost" onClick={reset}>Try again</button>
        </div>
      ) : (
        <button type="button" className="btn-gold" onClick={submit} disabled={Object.keys(answers).length === 0}>
          Check answers
        </button>
      )}
    </div>
  )
}
