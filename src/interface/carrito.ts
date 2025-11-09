// types/index.ts

import { Producto } from "./productos";


export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface ContextoCarrito {
  carrito: ItemCarrito[];
  contadorCarrito: number;
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (idProducto: number) => void;
  actualizarCantidad: (idProducto: number, nuevaCantidad: number) => void;
  vaciarCarrito: () => void;
  calcularTotal: () => number;
}