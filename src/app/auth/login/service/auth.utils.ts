// lib/utils/auth.utils.ts

import { Usuario } from "@/interface/auth"


class AuthUtils {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      return token
    }
    return null
  }

  setUser(user: Usuario): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  getUser(): Usuario | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      return user
    }
    return null
  }

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  isAuthenticated(): boolean {
    const authenticated = !!this.getToken()
    return authenticated
  }
}

export const authUtils = new AuthUtils()