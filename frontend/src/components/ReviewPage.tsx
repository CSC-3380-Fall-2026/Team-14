import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { validateReview } from '../accountValidation'
import type { ReviewErrors, ReviewFields } from '../accountValidation'
import './Pages.css'

type Props = { draft: ReviewFields; onChange: (changes: Partial<ReviewFields>) => void; onSave: () => void; onClear: () => void; saved: boolean }

export default function ReviewPage({ draft, onChange, onSave, onClear, saved }: Props) {
  const [errors, setErrors] = useState<ReviewErrors>({})
  const [cleared, setCleared] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function change(key: keyof ReviewFields, value: string) {
    onChange({ [key]: value })
    setErrors(current => ({ ...current, [key]: undefined }))
    setCleared(false)
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateReview(draft)
    setErrors(nextErrors)
    setCleared(false)
    const first = (['subject', 'rating', 'text'] as const).find(key => nextErrors[key])
    if (first) {
      (formRef.current?.elements.namedItem(first) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.focus()
      return
    }
    onSave()
  }

  function clear() {
    onClear()
    setErrors({})
    setCleared(true)
    ;(formRef.current?.elements.namedItem('subject') as HTMLInputElement | null)?.focus()
  }

  return (
    <section className="content-page account-page" aria-labelledby="page-title">
      <p className="eyebrow">Review draft · this visit only</p>
      <h1 id="page-title">Write a review</h1>
      <p className="page-intro">Keep your thoughts together while you explore GeauxTravel.</p>
      <div className="page-panel">
        <p className="scope-notice" id="review-scope">This draft stays available as you move between pages during this visit. Refreshing or closing the page clears it. Nothing is sent or published.</p>
        <form ref={formRef} noValidate onSubmit={save} aria-describedby="review-scope">
          {Object.values(errors).some(Boolean) && <p className="form-error-summary" role="alert">Check the highlighted fields below.</p>}
          <div className="form-field"><label htmlFor="review-subject">Trip name</label><input id="review-subject" name="subject" value={draft.subject} maxLength={100} required onChange={event => change('subject', event.target.value)} aria-invalid={errors.subject ? true : undefined} aria-describedby={errors.subject ? 'review-subject-error' : undefined} />{errors.subject && <p className="field-error" id="review-subject-error">{errors.subject}</p>}</div>
          <div className="form-field"><label htmlFor="review-rating">Rating</label><select id="review-rating" name="rating" value={draft.rating} required onChange={event => change('rating', event.target.value)} aria-invalid={errors.rating ? true : undefined} aria-describedby={errors.rating ? 'review-rating-error' : undefined}><option value="">Choose a rating</option>{[1, 2, 3, 4, 5].map(rating => <option key={rating} value={rating}>{rating} {rating === 1 ? 'star' : 'stars'}</option>)}</select>{errors.rating && <p className="field-error" id="review-rating-error">{errors.rating}</p>}</div>
          <div className="form-field"><label htmlFor="review-text">Your review</label><textarea id="review-text" name="text" rows={7} maxLength={2000} required value={draft.text} onChange={event => change('text', event.target.value)} aria-invalid={errors.text ? true : undefined} aria-describedby={`review-text-hint${errors.text ? ' review-text-error' : ''}`} /><p className="field-hint" id="review-text-hint">{draft.text.length}/2,000 characters</p>{errors.text && <p className="field-error" id="review-text-error">{errors.text}</p>}</div>
          <div className="page-actions"><button className="page-button" type="submit">Save draft for this visit</button><button className="page-button secondary" type="button" onClick={clear}>Clear draft</button></div>
          <div className="page-status" role="status" aria-live="polite">{saved && <p>Draft saved for this visit only. It has not been sent or published. Refreshing clears it.</p>}{cleared && <p>Review draft cleared.</p>}</div>
        </form>
      </div>
      <nav className="page-links" aria-label="Review options"><a href="#/itinerary">Back to itinerary</a><a href="#/trips">My trips</a></nav>
    </section>
  )
}
