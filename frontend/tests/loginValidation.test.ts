import assert from 'node:assert/strict'
import test from 'node:test'
import { validateLogin } from '../src/loginValidation.ts'

// Catches missing required-field checks without tying the UI to exact copy.
test('identifies both missing fields', () => {
  const errors = validateLogin({ email: '', password: '' })
  assert.ok(errors.email)
  assert.ok(errors.password)
})

test('identifies fields containing only whitespace as missing', () => {
  const errors = validateLogin({ email: '   ', password: '   ' })
  assert.ok(errors.email)
  assert.ok(errors.password)
})

// Catches incomplete address checks and email failures leaking to password.
for (const email of ['traveler', 'traveler@', '@example.com', 'traveler@example', 'two names@example.com']) {
  test(`rejects malformed email ${email}`, () => {
    const errors = validateLogin({ email, password: 'example-password' })
    assert.ok(errors.email)
    assert.equal(errors.password, undefined)
  })
}

// Catches invented password length rules and rejection of surrounding email spaces.
test('accepts a complete email and a nonempty password for local checks', () => {
  assert.deepEqual(validateLogin({ email: ' traveler@example.com ', password: 'x' }), {})
})

test('reports a missing password independently of a valid email', () => {
  const errors = validateLogin({ email: 'traveler@example.com', password: '' })
  assert.equal(errors.email, undefined)
  assert.ok(errors.password)
})
