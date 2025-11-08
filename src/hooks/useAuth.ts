// hooks/useAuth.ts
'use client'

import { authService } from '@/app/auth/login/service/auth.service'
import { AuthResponse, Datos_Registro, Login, Usuario } from '@/interface/auth'
import { useState, useEffect, useCallback } from 'react'

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Cargar usuario al inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        setIsAuthenticated(!!currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback(async (loginData: Login): Promise<AuthResponse> => {
    setIsLoading(true)
    
    try {
      const result = await authService.login(loginData)
      
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        message: 'Error inesperado en el login'
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (registerData: Datos_Registro): Promise<AuthResponse> => {
    setIsLoading(true)
    
    try {
      const result = await authService.register(registerData)
      return result
    } catch (error) {
      return {
        success: false,
        message: 'Error inesperado en el registro'
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout
  }
}