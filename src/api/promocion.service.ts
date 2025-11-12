// api/promociones.service.ts
import { 
  Promocion, 
  ProductoPromocion,
  DatosCrearPromocion, 
  DatosActualizarPromocion,
  DatosCrearProductoPromocion,
  DatosCrearPromocionConProductos,
  DatosActualizarPromocionConProductos,
  RespuestaPromociones, 
  RespuestaPromocion,
  RespuestaProductoPromociones,
  RespuestaProductoPromocion,
  FiltrosPromocionesInterface,
  FiltrosProductoPromocionInterface
} from '@/interface/promocion'
import { utilidadesAutenticacion } from '@/lib/autenticacion'

class ServicioPromociones {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

  private obtenerHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = utilidadesAutenticacion.obtenerToken()
    if (token) {
      headers['Authorization'] = `Token ${token}`
    }

    return headers
  }

  /**
   * Verificar endpoints disponibles (para debugging)
   */
  async verificarEndpoints(): Promise<void> {
    try {
      console.log('🔍 Verificando endpoints disponibles...');
      
      // Verificar endpoint de promociones
      const testPromociones = await fetch(`${this.urlBase}/promociones/`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      });
      console.log('✅ Endpoint /promociones/:', testPromociones.status, testPromociones.statusText);
      
      // Verificar endpoint de producto-promociones
      const testProductoPromociones = await fetch(`${this.urlBase}/productospromociones/`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      });
      console.log('✅ Endpoint /productopromociones/:', testProductoPromociones.status, testProductoPromociones.statusText);
      
    } catch (error) {
      console.error('❌ Error verificando endpoints:', error);
    }
  }

  // ========== CRUD PROMOCIONES ==========

  /**
   * Obtener todas las promociones con filtros opcionales
   */
  async obtenerPromociones(filtros: FiltrosPromocionesInterface = {}): Promise<RespuestaPromociones> {
    try {
      const parametros = new URLSearchParams()
      
      if (filtros.buscar) parametros.append('search', filtros.buscar)
      if (filtros.estado !== undefined) parametros.append('estado', filtros.estado.toString())
      if (filtros.fecha_inicio_desde) parametros.append('fecha_inicio_desde', filtros.fecha_inicio_desde)
      if (filtros.fecha_inicio_hasta) parametros.append('fecha_inicio_hasta', filtros.fecha_inicio_hasta)
      if (filtros.fecha_fin_desde) parametros.append('fecha_fin_desde', filtros.fecha_fin_desde)
      if (filtros.fecha_fin_hasta) parametros.append('fecha_fin_hasta', filtros.fecha_fin_hasta)
      if (filtros.monto_min) parametros.append('monto_min', filtros.monto_min.toString())
      if (filtros.monto_max) parametros.append('monto_max', filtros.monto_max.toString())
      if (filtros.pagina) parametros.append('page', filtros.pagina.toString())
      if (filtros.limite) parametros.append('page_size', filtros.limite.toString())

      const url = `${this.urlBase}/promociones/${parametros.toString() ? `?${parametros.toString()}` : ''}`

      const respuesta = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()
      
      let promociones: Promocion[] = []
      let total = 0
      let paginaActual = 1
      let totalPaginas = 1

      if (Array.isArray(datos)) {
        promociones = datos
        total = datos.length
      } else if (datos.results && Array.isArray(datos.results)) {
        promociones = datos.results
        total = datos.count || datos.results.length
        paginaActual = datos.current_page || 1
        totalPaginas = datos.total_pages || Math.ceil(total / (filtros.limite || 10))
      } else {
        promociones = datos
        total = 1
      }

      return {
        exito: true,
        datos: promociones,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo promociones:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener promociones'
      }
    }
  }

  /**
   * Obtener una promoción por ID
   */
  async obtenerPromocionPorId(id: number): Promise<RespuestaPromocion> {
    try {
      const respuesta = await fetch(`${this.urlBase}/promociones/${id}/`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error('Promoción no encontrada')
        }
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos
      }
    } catch (error) {
      console.error('❌ Error obteniendo promoción:', error)
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje: error instanceof Error ? error.message : 'Error al obtener promoción'
      }
    }
  }

  /**
   * Crear una nueva promoción
   */
  async crearPromocion(datosPromocion: DatosCrearPromocion): Promise<RespuestaPromocion> {
    try {
      const cuerpo = {
        fecha_inicio: datosPromocion.fecha_inicio,
        fecha_fin: datosPromocion.fecha_fin,
        descripcion: datosPromocion.descripcion,
        monto: parseFloat(datosPromocion.monto.toString()),
        estado: datosPromocion.estado !== undefined ? datosPromocion.estado : true
      }

      console.log('📤 Creando promoción:', cuerpo);

      const respuesta = await fetch(`${this.urlBase}/promociones/`, {
        method: 'POST',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpo)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}))
        console.error('❌ Error del backend:', errorData);
        
        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === 'object') {
          const erroresCampo = Object.entries(errorData)
            .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
            .join('; ');
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }
        
        throw new Error(mensajeError);
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos,
        mensaje: 'Promoción creada exitosamente'
      }
    } catch (error) {
      console.error('❌ Error creando promoción:', error)
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje: error instanceof Error ? error.message : 'Error al crear promoción'
      }
    }
  }

  /**
   * Crear promoción con productos (Método Principal)
   */
  async crearPromocionConProductos(datosPromocion: DatosCrearPromocionConProductos): Promise<RespuestaPromocion> {
    try {
      console.log('📥 Datos recibidos para crear promoción con productos:', datosPromocion);

      // PRIMERO: Intentar método alternativo (todo en una petición)
      try {
        const resultadoAlternativo = await this.crearPromocionConProductosAlternativo(datosPromocion);
        if (resultadoAlternativo.exito) {
          return resultadoAlternativo;
        }
      } catch (errorAlt) {
        console.log('⚠️ Método alternativo falló, intentando método original...');
      }

      // SEGUNDO: Método original (dos peticiones)
      // 1. Primero crear la promoción
      const cuerpoPromocion = {
        fecha_inicio: datosPromocion.fecha_inicio,
        fecha_fin: datosPromocion.fecha_fin,
        descripcion: datosPromocion.descripcion,
        monto: parseFloat(datosPromocion.monto.toString()),
        estado: datosPromocion.estado !== undefined ? datosPromocion.estado : true
      }

      console.log('📤 Enviando promoción al backend:', cuerpoPromocion);

      const respuestaPromocion = await fetch(`${this.urlBase}/promociones/`, {
        method: 'POST',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpoPromocion)
      })

      if (!respuestaPromocion.ok) {
        const errorData = await respuestaPromocion.json().catch(() => ({}))
        console.error('❌ Error del backend al crear promoción:', errorData);
        
        let mensajeError = `Error ${respuestaPromocion.status}: ${respuestaPromocion.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === 'object') {
          const erroresCampo = Object.entries(errorData)
            .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
            .join('; ');
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }
        
        throw new Error(mensajeError);
      }

      const promocionCreada = await respuestaPromocion.json();
      console.log('✅ Promoción creada exitosamente:', promocionCreada);

      // 2. Luego crear las relaciones producto-promoción
      if (datosPromocion.productos_ids && datosPromocion.productos_ids.length > 0) {
        console.log('📤 Creando relaciones con productos:', datosPromocion.productos_ids);
        
        try {
          await this.crearRelacionesProductoPromocion(promocionCreada.id, datosPromocion.productos_ids);
          console.log('✅ Relaciones producto-promoción creadas exitosamente');
        } catch (errorRelaciones) {
          console.error('⚠️ Error creando relaciones, pero la promoción fue creada:', errorRelaciones);
          // No lanzamos error aquí para que al menos la promoción se cree
        }
      }

      return {
        exito: true,
        datos: promocionCreada,
        mensaje: 'Promoción creada exitosamente' + 
          (datosPromocion.productos_ids?.length > 0 ? ' con productos' : '')
      };
    } catch (error) {
      console.error('❌ Error creando promoción con productos:', error)
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje: error instanceof Error ? error.message : 'Error al crear promoción con productos'
      }
    }
  }

  /**
   * Método alternativo: Crear promoción con productos en una sola petición
   */
  async crearPromocionConProductosAlternativo(datosPromocion: DatosCrearPromocionConProductos): Promise<RespuestaPromocion> {
    try {
      console.log('📥 Usando método alternativo para crear promoción con productos:', datosPromocion);

      // Intentar enviar todo en una sola petición
      const cuerpo = {
        fecha_inicio: datosPromocion.fecha_inicio,
        fecha_fin: datosPromocion.fecha_fin,
        descripcion: datosPromocion.descripcion,
        monto: parseFloat(datosPromocion.monto.toString()),
        estado: datosPromocion.estado !== undefined ? datosPromocion.estado : true,
        productos: datosPromocion.productos_ids // Enviar los productos directamente
      };

      console.log('📤 Enviando datos completos al backend:', cuerpo);

      const respuesta = await fetch(`${this.urlBase}/promociones/`, {
        method: 'POST',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpo)
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error('❌ Error del backend en método alternativo:', errorData);
        
        // Si falla, lanzar error para que se use el método original
        throw new Error(`Método alternativo falló: ${respuesta.status} ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();
      console.log('✅ Promoción con productos creada exitosamente (método alternativo):', datos);

      return {
        exito: true,
        datos: datos,
        mensaje: 'Promoción creada exitosamente con productos'
      };
    } catch (error) {
      console.error('❌ Error en método alternativo:', error);
      throw error; // Relanzar para que el método principal lo capture
    }
  }

  /**
   * Actualizar una promoción existente
   */
  async actualizarPromocion(id: number, datosActualizacion: Partial<DatosActualizarPromocion>): Promise<RespuestaPromocion> {
    try {
      console.log('📤 Actualizando promoción:', datosActualizacion);

      const respuesta = await fetch(`${this.urlBase}/promociones/${id}/`, {
        method: 'PATCH',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(datosActualizacion)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}))
        console.error('❌ Error del backend:', errorData);
        
        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === 'object') {
          const erroresCampo = Object.entries(errorData)
            .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
            .join('; ');
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }
        
        throw new Error(mensajeError);
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos,
        mensaje: 'Promoción actualizada exitosamente'
      }
    } catch (error) {
      console.error('❌ Error actualizando promoción:', error)
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje: error instanceof Error ? error.message : 'Error al actualizar promoción'
      }
    }
  }

  /**
   * Actualizar promoción con productos
   */
  async actualizarPromocionConProductos(id: number, datosActualizacion: DatosActualizarPromocionConProductos): Promise<RespuestaPromocion> {
    try {
      console.log('📤 Actualizando promoción con productos:', datosActualizacion);

      // 1. Actualizar la promoción
      if (datosActualizacion.productos_ids === undefined) {
        // Si no vienen productos, actualizar solo la promoción
        const respuesta = await this.actualizarPromocion(id, datosActualizacion);
        return respuesta;
      }

      // Actualizar datos básicos de la promoción
      const { productos_ids, ...datosPromocion } = datosActualizacion;
      
      if (Object.keys(datosPromocion).length > 0) {
        console.log('📤 Actualizando datos de promoción:', datosPromocion);
        await fetch(`${this.urlBase}/promociones/${id}/`, {
          method: 'PATCH',
          headers: this.obtenerHeaders(),
          body: JSON.stringify(datosPromocion)
        });
      }

      // 2. Actualizar relaciones producto-promoción
      if (productos_ids !== undefined) {
        // Primero eliminar todas las relaciones existentes
        const relacionesExistentes = await this.obtenerProductosPorPromocion(id);
        if (relacionesExistentes.exito) {
          for (const relacion of relacionesExistentes.datos) {
            await this.eliminarProductoPromocion(relacion.id);
          }
        }
        
        // Luego crear las nuevas relaciones
        if (productos_ids.length > 0) {
          await this.crearRelacionesProductoPromocion(id, productos_ids);
        }
      }

      // 3. Obtener la promoción actualizada
      const promocionActualizada = await this.obtenerPromocionPorId(id);

      return {
        exito: true,
        datos: promocionActualizada.datos,
        mensaje: 'Promoción actualizada exitosamente con productos'
      };
    } catch (error) {
      console.error('❌ Error actualizando promoción con productos:', error)
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje: error instanceof Error ? error.message : 'Error al actualizar promoción con productos'
      }
    }
  }

  /**
   * Eliminar una promoción
   */
  async eliminarPromocion(id: number): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const respuesta = await fetch(`${this.urlBase}/promociones/${id}/`, {
        method: 'DELETE',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return {
        exito: true,
        mensaje: 'Promoción eliminada exitosamente'
      }
    } catch (error) {
      console.error('❌ Error eliminando promoción:', error)
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al eliminar promoción'
      }
    }
  }

  // ========== CRUD PRODUCTO_PROMOCION ==========

  /**
   * Obtener todas las relaciones producto-promoción
   */
  async obtenerProductoPromociones(filtros: FiltrosProductoPromocionInterface = {}): Promise<RespuestaProductoPromociones> {
    try {
      const parametros = new URLSearchParams()
      
      if (filtros.producto_id) parametros.append('producto_id', filtros.producto_id.toString())
      if (filtros.promocion_id) parametros.append('promocion_id', filtros.promocion_id.toString())
      if (filtros.fecha_desde) parametros.append('fecha_desde', filtros.fecha_desde)
      if (filtros.fecha_hasta) parametros.append('fecha_hasta', filtros.fecha_hasta)
      if (filtros.pagina) parametros.append('page', filtros.pagina.toString())
      if (filtros.limite) parametros.append('page_size', filtros.limite.toString())

      const url = `${this.urlBase}/productopromociones/${parametros.toString() ? `?${parametros.toString()}` : ''}`

      const respuesta = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()
      
      let productoPromociones: ProductoPromocion[] = []
      let total = 0
      let paginaActual = 1
      let totalPaginas = 1

      if (Array.isArray(datos)) {
        productoPromociones = datos
        total = datos.length
      } else if (datos.results && Array.isArray(datos.results)) {
        productoPromociones = datos.results
        total = datos.count || datos.results.length
        paginaActual = datos.current_page || 1
        totalPaginas = datos.total_pages || Math.ceil(total / (filtros.limite || 10))
      } else {
        productoPromociones = datos
        total = 1
      }

      return {
        exito: true,
        datos: productoPromociones,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo producto-promociones:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener producto-promociones'
      }
    }
  }

  /**
   * Crear una nueva relación producto-promoción
   */
  async crearProductoPromocion(datosProductoPromocion: DatosCrearProductoPromocion): Promise<RespuestaProductoPromocion> {
    try {
      const cuerpo = {
        producto_id: datosProductoPromocion.producto_id,
        promocion_id: datosProductoPromocion.promocion_id
      }

      console.log('📤 Creando producto-promoción:', cuerpo);

      const respuesta = await fetch(`${this.urlBase}/productospromociones/`, {
        method: 'POST',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpo)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}))
        console.error('❌ Error del backend:', errorData);
        
        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === 'object') {
          const erroresCampo = Object.entries(errorData)
            .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
            .join('; ');
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }
        
        throw new Error(mensajeError);
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos,
        mensaje: 'Producto agregado a promoción exitosamente'
      }
    } catch (error) {
      console.error('❌ Error creando producto-promoción:', error)
      return {
        exito: false,
        datos: {} as ProductoPromocion,
        mensaje: error instanceof Error ? error.message : 'Error al crear producto-promoción'
      }
    }
  }

  /**
   * Eliminar una relación producto-promoción
   */
  async eliminarProductoPromocion(id: number): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productospromociones/${id}/`, {
        method: 'DELETE',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return {
        exito: true,
        mensaje: 'Producto removido de promoción exitosamente'
      }
    } catch (error) {
      console.error('❌ Error eliminando producto-promoción:', error)
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al eliminar producto-promoción'
      }
    }
  }

  /**
   * Obtener productos por promoción
   */
  async obtenerProductosPorPromocion(promocionId: number): Promise<RespuestaProductoPromociones> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productospromociones/?promocion=${promocionId}`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()
      console.log(datos)
      let productoPromociones: ProductoPromocion[] = []
      if (Array.isArray(datos)) {
        productoPromociones = datos
      } else if (datos.results && Array.isArray(datos.results)) {
        productoPromociones = datos.results
      } else {
        productoPromociones = datos
      }

      return {
        exito: true,
        datos: productoPromociones
      }
    } catch (error) {
      console.error('❌ Error obteniendo productos por promoción:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener productos por promoción'
      }
    }
  }

  /**
   * Obtener promociones por producto
   */
  async obtenerPromocionesPorProducto(productoId: number): Promise<RespuestaProductoPromociones> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productospromociones/?producto_id=${productoId}`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      let productoPromociones: ProductoPromocion[] = []
      if (Array.isArray(datos)) {
        productoPromociones = datos
      } else if (datos.results && Array.isArray(datos.results)) {
        productoPromociones = datos.results
      } else {
        productoPromociones = datos
      }

      return {
        exito: true,
        datos: productoPromociones
      }
    } catch (error) {
      console.error('❌ Error obteniendo promociones por producto:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener promociones por producto'
      }
    }
  }

  /**
   * Obtener productos de una promoción (para edición)
   */
  async obtenerProductosDePromocion(promocionId: number): Promise<number[]> {
    try {
      const respuesta = await this.obtenerProductosPorPromocion(promocionId);
      if (respuesta.exito) {
        return respuesta.datos.map(pp => 
          typeof pp.producto === 'object' ? pp.producto.id : pp.producto_id
        );
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo productos de promoción:', error);
      return [];
    }
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Crear múltiples relaciones producto-promoción
   */
  private async crearRelacionesProductoPromocion(promocionId: number, productosIds: number[]): Promise<void> {
    console.log(`🔗 Creando ${productosIds.length} relaciones para promoción ${promocionId}`);
    
    for (const productoId of productosIds) {
      try {
        const cuerpo = {
          producto_id: productoId,
          promocion_id: promocionId
        };

        console.log(`📤 Creando relación:`, cuerpo);

        const respuesta = await fetch(`${this.urlBase}/productospromociones/`, {
          method: 'POST',
          headers: this.obtenerHeaders(),
          body: JSON.stringify(cuerpo)
        });

        if (!respuesta.ok) {
          const errorData = await respuesta.json().catch(() => ({}));
          console.error(`❌ Error creando relación para producto ${productoId}:`, errorData);
          // Continuamos con el siguiente producto en lugar de fallar completamente
          continue;
        }

        const datos = await respuesta.json();
        console.log(`✅ Relación creada para producto ${productoId}:`, datos);

      } catch (error) {
        console.error(`❌ Error creando relación para producto ${productoId}:`, error);
        // Continuamos con el siguiente producto
      }
    }
  }

  // ========== VALIDACIONES ==========

  /**
   * Validar datos de la promoción
   */
  validarPromocion(promocion: Partial<Promocion>): { valido: boolean; errores: string[] } {
    const errores: string[] = []

    if (!promocion.descripcion || promocion.descripcion.trim().length === 0) {
      errores.push('La descripción es requerida')
    }

    if (!promocion.fecha_inicio) {
      errores.push('La fecha de inicio es requerida')
    }

    if (!promocion.fecha_fin) {
      errores.push('La fecha de fin es requerida')
    }

    if (promocion.fecha_inicio && promocion.fecha_fin) {
      const fechaInicio = new Date(promocion.fecha_inicio)
      const fechaFin = new Date(promocion.fecha_fin)
      if (fechaInicio >= fechaFin) {
        errores.push('La fecha de fin debe ser posterior a la fecha de inicio')
      }
    }

    if (!promocion.monto || parseFloat(promocion.monto.toString()) <= 0) {
      errores.push('El monto debe ser mayor a 0')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }

  /**
   * Validar datos de producto-promoción
   */
  validarProductoPromocion(productoPromocion: Partial<ProductoPromocion>): { valido: boolean; errores: string[] } {
    const errores: string[] = []

    if (!productoPromocion.producto_id) {
      errores.push('El producto es requerido')
    }

    if (!productoPromocion.promocion_id) {
      errores.push('La promoción es requerida')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }

  // ========== UTILIDADES ==========

  /**
   * Formatear fecha para display
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES')
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(monto)
  }

  /**
   * Formatear porcentaje
   */
  formatearPorcentaje(monto: number): string {
    return `${monto}%`
  }

  /**
   * Verificar si una promoción está activa
   */
  esPromocionActiva(promocion: Promocion): boolean {
    if (!promocion.estado) return false;
    
    const hoy = new Date();
    const fechaInicio = new Date(promocion.fecha_inicio);
    const fechaFin = new Date(promocion.fecha_fin);
    
    return hoy >= fechaInicio && hoy <= fechaFin;
  }

  /**
   * Obtener estado de la promoción
   */
  obtenerEstadoPromocion(promocion: Promocion): string {
    if (!promocion.estado) return 'inactiva';
    
    const hoy = new Date();
    const fechaInicio = new Date(promocion.fecha_inicio);
    const fechaFin = new Date(promocion.fecha_fin);
    
    if (hoy < fechaInicio) return 'pendiente';
    if (hoy > fechaFin) return 'expirada';
    return 'activa';
  }
}

export const servicioPromociones = new ServicioPromociones()