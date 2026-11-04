import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { validateLogin } from '../loginValidation'
import type { LoginErrors } from '../loginValidation'

export default function LoginPage() {
  const [errors, setErrors] = useState<LoginErrors>({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [entriesChecked, setEntriesChecked] = useState(false)
  const emailInput = useRef<HTMLInputElement>(null)
  const passwordInput = useRef<HTMLInputElement>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    const nextErrors = validateLogin({
      email: String(fields.get('email') ?? ''),
      password: String(fields.get('password') ?? ''),
    })

    setErrors(nextErrors)
    setEntriesChecked(false)

    if (nextErrors.email) {
      emailInput.current?.focus()
    } else if (nextErrors.password) {
      passwordInput.current?.focus()
    } else {
      setEntriesChecked(true)
    }
  }

  return (
    <>
      <p className="eyebrow">Welcome to GeauxTravel</p>
      <h1 id="page-title">Log in</h1>
      <p className="login-intro">Keep your next adventure in one place.</p>

      <div className="login-panel">
        <p className="sign-in-notice" id="sign-in-notice">
          Account sign-in is not connected yet. You can check your entries
          here, but your details will not be sent or saved.
        </p>
        <form
          noValidate
          onSubmit={handleSubmit}
          onInput={() => setEntriesChecked(false)}
          aria-describedby="sign-in-notice"
        >
          {(errors.email || errors.password) && (
            <p className="form-error-summary" role="alert">
              Check the highlighted fields below.
            </p>
          )}
          <div className="form-field">
            <label htmlFor="login-email">Email address</label>
            <input
              ref={emailInput}
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <div className="password-field">
              <input
                ref={passwordInput}
                id="login-password"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                className="password-toggle"
                type="button"
                aria-pressed={passwordVisible}
                aria-controls="login-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? 'Hide password' : 'Show password'}
              </button>
            </div>
            {errors.password && <p className="field-error" id="password-error">{errors.password}</p>}
          </div>
          <button className="sign-in-button" type="submit">Sign in</button>
          <div className="sign-in-status" role="status" aria-live="polite">
            {entriesChecked && (
              <p>
                Your entries passed these checks. Account sign-in is not
                connected yet, so you are still signed out. Your details
                were not sent or saved.
              </p>
            )}
          </div>
        </form>
      </div>
      <a className="return-home" href="#/">Back to home</a>
    </>
  )
}
