export interface CreateAgentData {
  name: string
  email: string
  mobile: string
  password: string
}

export interface UpdateAgentData {
  name?: string
  email?: string
  mobile?: string
  password?: string
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateMobile(mobile: string): boolean {
  const mobileRegex = /^[+]?[1-9][\d]{0,15}$/
  return mobileRegex.test(mobile.replace(/[\s\-$$$$]/g, ""))
}

export function validateAgentData(data: CreateAgentData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push("Please provide a valid email address")
  }

  if (!data.mobile || !validateMobile(data.mobile)) {
    errors.push("Please provide a valid mobile number")
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters long")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUpdateAgentData(data: UpdateAgentData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
    errors.push("Name must be at least 2 characters long")
  }

  if (data.email !== undefined && (!data.email || !validateEmail(data.email))) {
    errors.push("Please provide a valid email address")
  }

  if (data.mobile !== undefined && (!data.mobile || !validateMobile(data.mobile))) {
    errors.push("Please provide a valid mobile number")
  }

  if (data.password !== undefined && (!data.password || data.password.length < 6)) {
    errors.push("Password must be at least 6 characters long")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
