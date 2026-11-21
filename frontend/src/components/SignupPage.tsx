import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { validateSignup } from '../accountValidation'
import type { SignupErrors, SignupFields } from '../accountValidation'
import './Pages.css'

export default function SignupPage() {
  const [fields, setFields] = useState<SignupFields>({ email: '', password: '', confirmation: '' })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [checked, setChecked] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateSignup(fields)
    setErrors(nextErrors)
    setChecked(false)
    const first = (['email', 'password', 'confirmation'] as const).find(key => nextErrors[key])
    if (first) {
      (formRef.current?.elements.namedItem(first) as HTMLInputElement | null)?.focus()
      return
    }
    setFields(current => ({ ...current, password: '', confirmation: '' }))
    setChecked(true)
  }

  function change(key: keyof SignupFields, value: string) {
    setFields(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setChecked(false)
  }

  return (
    <section className="content-page account-page" aria-labelledby="page-title">
      <p className="eyebrow">Account preview · local checks only</p>
      <h1 id="page-title">Sign up</h1>
      <p className="page-intro">Explore the account form while planning as a guest.</p>
      <div className="page-panel">
        <p className="scope-notice" id="signup-scope">Account creation is not connected. These checks run in this page; your details are not sent or saved, and you remain signed out.</p>
        <form ref={formRef} onSubmit={submit} noValidate aria-describedby="signup-scope">
          {Object.values(errors).some(Boolean) && <p className="form-error-summary" role="alert">Check the highlighted fields below.</p>}
          <div className="form-field">
            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" name="email" type="email" autoComplete="email" required value={fields.email} onChange={event => change('email', event.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'signup-email-error' : undefined} />
            {errors.email && <p className="field-error" id="signup-email-error">{errors.email}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" autoComplete="new-password" required value={fields.password} onChange={event => change('password', event.target.value)} aria-invalid={errors.password ? true : undefined} aria-describedby={errors.password ? 'signup-password-error' : undefined} />
            {errors.password && <p className="field-error" id="signup-password-error">{errors.password}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="signup-confirmation">Confirm password</label>
            <input id="signup-confirmation" name="confirmation" type="password" autoComplete="new-password" required value={fields.confirmation} onChange={event => change('confirmation', event.target.value)} aria-invalid={errors.confirmation ? true : undefined} aria-describedby={errors.confirmation ? 'signup-confirmation-error' : undefined} />
            {errors.confirmation && <p className="field-error" id="signup-confirmation-error">{errors.confirmation}</p>}
          </div>
          <button className="page-button" type="submit">Check account details</button>
          <div className="page-status" role="status" aria-live="polite">{checked && <p>Your details passed the local checks. No account was created. You are still signed out, no details were sent or saved, and the password fields have been cleared.</p>}</div>
        </form>
      </div>
      <nav className="page-links" aria-label="Account options"><a href="#/login">Log in</a><a href="#/preferences">Plan as a guest</a></nav>
    </section>
  )
}
