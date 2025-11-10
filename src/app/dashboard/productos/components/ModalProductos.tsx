// app/productos/components/ModalProducto.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Producto } from '@/interface/productos';

interface ModalProductoProps {
  producto: Producto | null;
  onGuardar: (datos: any) => void;
  onCancelar: () => void;
}

export default function ModalProducto({ producto, onGuardar, onCancelar }: ModalProductoProps) {
  const [formData, setFormData] = useState({
    descripcion: '',
    precio: '',
    stock: '',
    estado: 'Activo' as 'Activo' | 'Inactivo',
    subcategoria: '',
    imagenes: [] as string[]
  });

  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    if (producto) {
      setFormData({
        descripcion: producto.descripcion,
        precio: producto.precio.toString(),
        stock: producto.stock.toString(),
        estado: producto.estado,
        subcategoria: producto.subcategoria.toString(),
        imagenes: producto.imagenes || []
      });
    } else {
      setFormData({
        descripcion: '',
        precio: '',
        stock: '',
        estado: 'Activo',
        subcategoria: '',
        imagenes: []
      });
    }
    setErrores([]);
  }, [producto]);

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevosErrores: string[] = [];
    
    if (!formData.descripcion.trim()) {
      nuevosErrores.push('La descripción es requerida');
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      nuevosErrores.push('El precio debe ser mayor a 0');
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      nuevosErrores.push('El stock no puede ser negativo');
    }
    
    if (!formData.subcategoria) {
      nuevosErrores.push('La subcategoría es requerida');
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    onGuardar({
      ...formData,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      subcategoria: parseInt(formData.subcategoria)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={manejarSubmit} className="p-6 space-y-4">
          {/* Errores */}
          {errores.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <ul className="text-red-600 dark:text-red-300 text-sm list-disc list-inside">
                {errores.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nombre del producto..."
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'Activo' | 'Inactivo' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Subcategoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subcategoría *
            </label>
            <input
              type="number"
              value={formData.subcategoria}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategoria: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="ID de subcategoría"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Nota: Necesitarás implementar un selector de subcategorías
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancelar}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              {producto ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}