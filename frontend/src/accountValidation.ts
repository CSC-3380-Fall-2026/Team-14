import { validateLogin } from './loginValidation.ts'

export type SignupFields = { email: string; password: string; confirmation: string }
export type SignupErrors = Partial<Record<keyof SignupFields, string>>
export function validateSignup(fields: SignupFields): SignupErrors {
  const errors: SignupErrors = validateLogin(fields)
  if (!fields.confirmation || fields.password !== fields.confirmation) errors.confirmation = 'Enter the same password in both fields.'
  return errors
}

export type ReviewFields = { subject: string; rating: string; text: string }
export type ReviewErrors = Partial<Record<keyof ReviewFields, string>>
export function validateReview(fields: ReviewFields): ReviewErrors {
  const errors: ReviewErrors = {}
  if (!fields.subject.trim() || fields.subject.trim().length > 100) errors.subject = 'Enter a trip name of up to 100 characters.'
  if (!/^[1-5]$/.test(fields.rating)) errors.rating = 'Choose a rating from 1 to 5.'
  if (!fields.text.trim() || fields.text.trim().length > 2000) errors.text = 'Write a review of 1 to 2,000 characters.'
  return errors
}
