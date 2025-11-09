// components/TarjetaDeProductos.tsx
"use client";

import {
  CardFlip,
  CardFlipFront,
  CardFlipBack,
  CardFlipHeader,
  CardFlipFooter,
  CardFlipTitle,
  CardFlipDescription,
  CardFlipContent,
} from "@/components/ui/card-flip";
import { Button } from "@/components/ui/button";
import { Box, ShoppingCart, Star, RefreshCw } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { Producto } from "@/interface/productos";
import { useState } from "react";

export default function TarjetaDeProductos() {
  const { productos, cargando, error, cargarProductos } = useProductos();

  // Productos destacados (los primeros 10 productos)
  const productosDestacados = productos.slice(0, 10);

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={() => cargarProductos()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  if (productosDestacados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No hay productos disponibles</p>
        <Button onClick={() => cargarProductos()} variant="outline">
          Recargar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-4">
      {productosDestacados.map((producto) => (
        <ProductoFlipCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

// Componente individual para cada producto
function ProductoFlipCard({ producto }: { producto: Producto }) {
  const [errorImagen, setErrorImagen] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(true);

  const imagenPrincipal = (producto.imagenes && producto.imagenes.length > 0 && !errorImagen) 
    ? producto.imagenes[0] 
    : '/placeholder-product.jpg';

  const manejarErrorImagen = () => {
    console.warn(`Error cargando imagen: ${imagenPrincipal}`);
    setErrorImagen(true);
    setCargandoImagen(false);
  };

  const manejarCargaImagen = () => {
    setCargandoImagen(false);
  };

  const manejarAgregarCarrito = () => {
    console.log('Agregar al carrito:', producto);
    // Aquí implementarás la lógica del carrito
  };

  const esMasVendido = producto.stock > 50;

  return (
    <CardFlip className="w-full select-none h-[540px]">
      {/* --- Lado Frontal de la Tarjeta --- */}
      <CardFlipFront className="flex flex-col justify-between h-full">
        <div className="mx-4 h-48 w-[calc(100%-2rem)] rounded-lg overflow-hidden bg-muted relative">
          {cargandoImagen && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          <img
            src={imagenPrincipal}
            alt={producto.descripcion}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cargandoImagen ? 'opacity-0' : 'opacity-100'
            }`}
            onError={manejarErrorImagen}
            onLoad={manejarCargaImagen}
            loading="lazy"
          />
        </div>

        <div className="flex items-center justify-between px-4">
          {esMasVendido && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Más Vendido
            </span>
          )}
          <div className="flex items-center space-x-1 text-sm font-medium text-primary/70">
            <Star className="w-5 h-5 fill-primary text-primary" />
            <span>4.5 (126)</span>
          </div>
        </div>

        <CardFlipHeader>
          <CardFlipTitle className="line-clamp-2">{producto.descripcion}</CardFlipTitle>
          <p className="text-2xl p-1 font-bold">Bs. {producto.precio.toLocaleString()}</p>
          <div className="flex items-center justify-between text-sm">
            <span className={`px-2 py-1 rounded-full ${
              producto.estado === 'Activo' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {producto.estado}
            </span>
            <span className="text-muted-foreground">
              Stock: {producto.stock}
            </span>
          </div>
        </CardFlipHeader>

        <CardFlipFooter className="flex gap-4 items-stretch">
          <button className="flex-1 bg-primary py-1 text-primary-foreground px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
            Ver Detalles
          </button>
          
          <button 
            className="w-12 bg-primary py-1 text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={manejarAgregarCarrito}
            disabled={producto.stock === 0 || producto.estado !== 'Activo'}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </CardFlipFooter>
      </CardFlipFront>

      {/* --- Lado Trasero de la Tarjeta --- */}
      <CardFlipBack className="h-full flex flex-col">
        <CardFlipHeader>
          <CardFlipTitle className="line-clamp-2">{producto.descripcion}</CardFlipTitle>
          <CardFlipDescription>
            {producto.subcategoria.descripcion} • {producto.subcategoria.categoria.descripcion}
          </CardFlipDescription>
        </CardFlipHeader>

        <CardFlipContent className="flex-1 overflow-auto space-y-4">
          <div className="flex items-start gap-3">
            <Box className="text-primary w-6 h-6 mt-1" />
            <div>
              <h4 className="font-semibold">Descripción</h4>
              <p className="text-sm text-muted-foreground">
                {producto.descripcion}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-6 h-6 mt-1" />
            <div>
              <h4 className="font-semibold">Precio</h4>
              <p className="text-sm text-muted-foreground">
                Bs. {producto.precio.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-6 h-6 mt-1" />
            <div>
              <h4 className="font-semibold">Disponibilidad</h4>
              <p className="text-sm text-muted-foreground">
                {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Agotado'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-6 h-6 mt-1" />
            <div>
              <h4 className="font-semibold">Estado</h4>
              <p className="text-sm text-muted-foreground">
                {producto.estado === 'Activo' ? 'Disponible para venta' : 'No disponible'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-6 h-6 mt-1" />
            <div>
              <h4 className="font-semibold">Categoría</h4>
              <p className="text-sm text-muted-foreground">
                {producto.subcategoria.descripcion} - {producto.subcategoria.categoria.descripcion}
              </p>
            </div>
          </div>
        </CardFlipContent>

        <CardFlipFooter className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {producto.stock > 0 
              ? 'Envío exprés gratuito por compras mayores a Bs. 2,999'
              : 'Producto temporalmente agotado'
            }
          </p>
        </CardFlipFooter>
      </CardFlipBack>
    </CardFlip>
  );
}