
// lib/types/auth.types.ts
export interface Perfil {
  id: number
  user: string
  rol: string
  telefono: string | null
}

export interface Usuario {
  id: number
  email: string
  perfil: Perfil
}

export interface Login {
  email: string
  password: string
}

export interface Datos_Registro {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: Usuario
  errors?: Record<string, string[]>
}

export interface AuthState {
  user: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
}