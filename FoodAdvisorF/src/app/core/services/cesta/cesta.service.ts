import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { Cesta } from './../../../security/models/Cesta';

@Injectable({
  providedIn: 'root'
})


export class CestaService {

  private productosEnCesta: any[] = [];

  private apiUrl = environment.apiUrl;

  constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
  ) { }

  // Obtener los productos en el carrito
  obtenerProductosEnCarrito() {
    return this.productosEnCesta;
  }

  // Agregar un producto al carrito
  agregarProductoAlCarrito(producto: any, cantidad: number) {
    
    this.http.post<Cesta>(`${this.apiUrl}/cestas-compra/addProducto`,{
      ID_prod : producto.ID_prod,
      cantidad : cantidad
    }).subscribe({
      next: (resp) => {
        this.snackBar.open("Producto añadido", "Entendido", {duration: 2000});

      },
    error: (err) => {
      this.snackBar.open("No se ha podido añadir el producto a la cesta. Pruebe más tarde", "Entendido", {duration: 2000});
      console.log(err.message)
    }
    });
  }
}
