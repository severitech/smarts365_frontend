// api/pagos.service.ts - VERSIÓN TEMPORAL
import { DatosPago, RespuestaCheckout, RespuestaVerificacionPago } from "@/interface/carrito"
import { utilidadesAutenticacion } from "@/lib/autenticacion"

interface DatosPagoConUsuario extends DatosPago {
  usuario_id?: number
}

class ServicioPagos {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

  /**
   * Crear sesión de checkout en Stripe
   */
  async crearCheckoutSession(
    datosPago: DatosPago, 
    usuarioId?: number
  ): Promise<RespuestaCheckout> {
    try {
      const datosEnvio: DatosPagoConUsuario = {
        ...datosPago,
        usuario_id: usuarioId
      }

      // Loguear token y headers para depuración
      const token = utilidadesAutenticacion.obtenerToken()
      const headers = {
        'Content-Type': 'application/json',
        ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
      }

      console.log('🔎 crearCheckoutSession: token en localStorage ->', token)
      console.log('🔎 crearCheckoutSession: headers enviados ->', headers)
      console.log('🔎 crearCheckoutSession: payload ->', datosEnvio)

      // Validación temprana: si no hay token, informar claramente
      if (!token) {
        throw new Error('No hay token de autenticación en localStorage. Por favor inicia sesión.')
      }

      const respuesta = await fetch(`${this.urlBase}/crear-checkout-session/`, {
        method: 'POST',
        headers,
        // ✅ TEMPORAL: Quita credentials hasta que arregles CORS
        // credentials: 'include', 
        body: JSON.stringify(datosEnvio)
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
  async verificarPago(
    sessionId: string, 
    usuarioId?: number
  ): Promise<RespuestaVerificacionPago> {
    try {
      const url = usuarioId 
        ? `${this.urlBase}/verificar-pago/?session_id=${sessionId}&usuario_id=${usuarioId}`
        : `${this.urlBase}/verificar-pago/?session_id=${sessionId}`

      const headers = {
        'Content-Type': 'application/json',
        ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
      }

      console.log('🔎 verificarPago: headers enviados ->', headers)

      const respuesta = await fetch(url, {
        method: 'GET',
        headers,
        // ✅ TEMPORAL: Quita credentials hasta que arregles CORS
        // credentials: 'include'
      })

      // Log para depuración (cliente)
      const tokenCheck = utilidadesAutenticacion.obtenerToken()
      console.log('🔎 verificarPago: token en localStorage ->', tokenCheck)
      console.log('🔎 verificarPago: url ->', url)

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