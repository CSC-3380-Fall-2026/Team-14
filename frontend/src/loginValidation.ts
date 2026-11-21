export interface LoginFields {
  email: string
  password: string
}

export interface LoginErrors {
  email?: string
  password?: string
}

export function validateLogin({ email, password }: LoginFields): LoginErrors {
  const errors: LoginErrors = {}
  const emailAddress = email.trim()

  if (!emailAddress) {
    errors.email = 'Enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
    errors.email = 'Enter a complete email address, like name@example.com.'
  }

  if (!password.trim()) {
    errors.password = 'Enter your password.'
  }

  return errors
}
