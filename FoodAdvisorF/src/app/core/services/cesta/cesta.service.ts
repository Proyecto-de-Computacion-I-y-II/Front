import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CestaService {

  private productosEnCesta: any[] = [];

  constructor() { }

  // Obtener los productos en el carrito
  obtenerProductosEnCarrito() {
    return this.productosEnCesta;
  }

  // Agregar un producto al carrito
  agregarProductoAlCarrito(producto: any, cantidad: number) {
    const productoExistente = this.productosEnCesta.find(p => p.id === producto.id);

    if (productoExistente) {
      productoExistente.cantidad += cantidad;
    } else {
      this.productosEnCesta.push({ ...producto, cantidad });
    }
  }
}
