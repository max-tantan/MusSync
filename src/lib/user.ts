export const USER_KEY = 'mussync.user.v1'

export function loadUser(): string {
  try {
    return localStorage.getItem(USER_KEY) ?? ''
  } catch {
    return ''
  }
}