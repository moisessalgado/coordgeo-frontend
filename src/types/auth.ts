export interface TokenResponse {
  access: string
  refresh: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
  display_name: string
}
