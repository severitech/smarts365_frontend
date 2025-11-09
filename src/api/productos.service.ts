// api/productos.service.ts
import { Producto, DatosCrearProducto, DatosActualizarProducto, RespuestaProductos, RespuestaProducto, FiltrosProductos } from '@/interface/productos'
import { utilidadesAutenticacion } from '@/lib/autenticacion'

/**
 * Servicio para manejar todas las operaciones de productos con el backend
 */
class ServicioProductos {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

  /**
   * Obtener todos los productos con filtros opcionales
   */
  async obtenerProductos(filtros: FiltrosProductos = {}): Promise<RespuestaProductos> {
    try {
      // Construir query string con filtros
      const parametros = new URLSearchParams()
      
      if (filtros.buscar) parametros.append('search', filtros.buscar)
      if (filtros.subcategoria) parametros.append('subcategoria', filtros.subcategoria.toString())
      if (filtros.estado) parametros.append('estado', filtros.estado)
      if (filtros.precio_min) parametros.append('precio_min', filtros.precio_min.toString())
      if (filtros.precio_max) parametros.append('precio_max', filtros.precio_max.toString())
      if (filtros.ordenar_por) parametros.append('ordering', filtros.ordenar_por)
      if (filtros.orden) parametros.append('order', filtros.orden)

      const url = `${this.urlBase}/productos/${parametros.toString() ? `?${parametros.toString()}` : ''}`
      
      console.log('🔄 Solicitando productos desde:', url)

      const respuesta = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
        },
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()
      

      return {
        exito: true,
        datos: Array.isArray(datos) ? datos : (datos.results || datos)
      }
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener productos'
      }
    }
  }

  /**
   * Obtener un producto por ID
   */
  async obtenerProductoPorId(id: number): Promise<RespuestaProducto> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
        },
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos
      }
    } catch (error) {
      console.error('❌ Error obteniendo producto:', error)
      return {
        exito: false,
        datos: {} as Producto,
        mensaje: error instanceof Error ? error.message : 'Error al obtener producto'
      }
    }
  }

  /**
   * Crear un nuevo producto
   */
  async crearProducto(datosProducto: DatosCrearProducto): Promise<RespuestaProducto> {
    try {
      // Para imágenes, necesitarías usar FormData
      const formData = new FormData()
      
      // Añadir campos básicos
      formData.append('descripcion', datosProducto.descripcion)
      formData.append('precio', datosProducto.precio.toString())
      formData.append('stock', datosProducto.stock.toString())
      formData.append('estado', datosProducto.estado)
      formData.append('subcategoria', datosProducto.subcategoria.toString())

      // Añadir imágenes si existen
      if (datosProducto.imagenes) {
        datosProducto.imagenes.forEach(imagen => {
          formData.append('imagenes', imagen)
        })
      }

      const respuesta = await fetch(`${this.urlBase}/productos/`, {
        method: 'POST',
        body: formData
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json()
        throw new Error(errorData.detail || `Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos,
        mensaje: 'Producto creado exitosamente'
      }
    } catch (error) {
      console.error('❌ Error creando producto:', error)
      return {
        exito: false,
        datos: {} as Producto,
        mensaje: error instanceof Error ? error.message : 'Error al crear producto'
      }
    }
  }

  /**
   * Actualizar un producto existente
   */
  async actualizarProducto(datosProducto: DatosActualizarProducto): Promise<RespuestaProducto> {
    try {
      const { id, ...datosActualizacion } = datosProducto

      const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
        },
        body: JSON.stringify(datosActualizacion)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json()
        throw new Error(errorData.detail || `Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos,
        mensaje: 'Producto actualizado exitosamente'
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error)
      return {
        exito: false,
        datos: {} as Producto,
        mensaje: error instanceof Error ? error.message : 'Error al actualizar producto'
      }
    }
  }

  /**
   * Eliminar un producto
   */
  async eliminarProducto(id: number): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
        },
        body: JSON.stringify({ estado: 'eliminado' })
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return {
        exito: true,
        mensaje: 'Producto eliminado exitosamente'
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error)
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al eliminar producto'
      }
    }
  }

  /**
   * Buscar productos por término
   */
  async buscarProductos(termino: string): Promise<RespuestaProductos> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productos/?search=${encodeURIComponent(termino)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
        },
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: Array.isArray(datos) ? datos : (datos.results || datos)
      }
    } catch (error) {
      console.error('❌ Error buscando productos:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al buscar productos'
      }
    }
  }
}

export const servicioProductos = new ServicioProductos()