// lib/services/auth.service.ts
import { Login, Datos_Registro, AuthResponse, Usuario } from '@/interface/auth'
import { authUtils } from './auth.utils'

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

  async login(loginData: Login): Promise<AuthResponse> {
    try {
  
      const response = await fetch(`${this.baseURL}/authz/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        // Guardar en localStorage
        authUtils.setToken(data.token)
        authUtils.setUser(data.user)
        
        
        return {
          success: true,
          message: 'Login exitoso',
          token: data.token,
          user: data.user
        }
      } else {
        const errorMessage = data.detail || data.message || data.error || 'Error en el login'
        console.log('❌ Error del servidor:', errorMessage)
        return {
          success: false,
          message: errorMessage
        }
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  }

  async register(registerData: Datos_Registro): Promise<AuthResponse> {
    try {
      // Validar contraseñas
      if (registerData.password !== registerData.confirmPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden'
        }
      }

      
      const response = await fetch(`${this.baseURL}/authz/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: 'Registro exitoso. Ya puedes iniciar sesión.'
        }
      } else {
        const errorMessage = data.detail || data.message || data.error || 'Error en el registro'
        return {
          success: false,
          message: errorMessage,
          errors: data.errors
        }
      }
    } catch (error) {
      console.error('❌ Error en registro:', error)
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      const token = authUtils.getToken()
      if (token) {
        await fetch(`${this.baseURL}/authz/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      authUtils.clearAuth()
    }
  }

  async getCurrentUser(): Promise<Usuario | null> {
    const user = authUtils.getUser()
    
    if (user && authUtils.getToken()) {
      return user
    }
    
    return null
  }

  // Para usar en headers de API calls
  getAuthHeaders(): HeadersInit {
    const token = authUtils.getToken()
    return token ? { 
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    } : {}
  }
}

export const authService = new AuthService()