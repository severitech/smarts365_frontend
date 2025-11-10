// api/pagos.service.ts
import { utilidadesAutenticacion } from '@/lib/autenticacion'

class ServicioPagos {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

  /**
   * Crear sesión de checkout en Stripe
   */
  async crearCheckoutSession(datosPago: any): Promise<any> {
    try {
      // ✅ Asegúrate de incluir las credenciales de autenticación
      const headers = {
        'Content-Type': 'application/json',
      };

      // ✅ Agregar headers de autenticación si el usuario está logueado
      const authHeaders = utilidadesAutenticacion.obtenerHeadersAutenticacion();
      Object.assign(headers, authHeaders);

      const respuesta = await fetch(`${this.urlBase}/crear-checkout-session/`, {
        method: 'POST',
        headers: headers,
        credentials: 'include', // ✅ Importante para cookies de sesión
        body: JSON.stringify(datosPago)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json()
        throw new Error(errorData.error || `Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return await respuesta.json()
    } catch (error) {
      console.error('❌ Error creando checkout session:', error)
      throw error
    }
  }

  /**
   * Verificar estado de un pago
   */
  async verificarPago(sessionId: string): Promise<any> {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // ✅ Agregar headers de autenticación
      const authHeaders = utilidadesAutenticacion.obtenerHeadersAutenticacion();
      Object.assign(headers, authHeaders);

      const respuesta = await fetch(`${this.urlBase}/verificar-pago/?session_id=${sessionId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // ✅ Importante para cookies de sesión
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json()
        throw new Error(errorData.error || `Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return await respuesta.json()
    } catch (error) {
      console.error('❌ Error verificando pago:', error)
      throw error
    }
  }
}

export const servicioPagos = new ServicioPagos()