import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cesta } from './../../../security/models/cesta';

interface PorcentajeCesta {
  id: number;
  ID_cesta: number;
  idNivel: number;
  porcentaje: string;
  created_at: string;
  updated_at: string;
  nivel_piramide: {
    idNivel: number;
    Nombre: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    minimo: string;
    maximo: string;
  };
}

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

  // Obtener los productos en el carrito (localmente)
  obtenerProductosEnCarritoLocal(): any[] {
    return this.productosEnCesta;
  }

  // Obtener los productos de la cesta desde la API por ID
  obtenerProductosDeCesta(idCesta: number): Observable<Cesta[]> {
    const url = `${this.apiUrl}/usuario/cestas/${idCesta}`;
    return this.http.get<Cesta[]>(url);
  }

  crearCesta(fecha_de_compra: string): Observable<any> {
    return this.http.post<Cesta>(`${this.apiUrl}/cestas-compra`, {
      fecha_compra: fecha_de_compra
    });
  }

  // Agregar un producto al carrito (envía una petición POST a la API)
  agregarProductoAlCarrito(producto: any, cantidad: number): Observable<any> {
    return this.http.post<Cesta>(`${this.apiUrl}/cestas-compra/addProducto`, {
      ID_prod: producto.ID_prod,
      cantidad: cantidad
    });
  }
  

  // Modificar la cantidad de un producto en el carrito (envía una petición PUT a la API)
  modificarCantidadCarrito(productoId: number, cantidad: number) {
    this.http.put(`${this.apiUrl}/cestas-compra/update-producto`, {
      ID_prod: productoId,
      cantidad: cantidad
    }).subscribe({
      next: (resp: any) => { // Ajusta 'any' al tipo de respuesta esperado
        this.snackBar.open("Cantidad actualizada", "Entendido", { duration: 2000 });
      },
      error: (err) => {
        this.snackBar.open("No se ha podido actualizar la cantidad. Pruebe más tarde", "Entendido", { duration: 2000 });
        console.log(err.message);
      }
    });
  }

  obtenerPorcentajesCesta(idCesta: number): Observable<PorcentajeCesta[]> {
    const url = `${this.apiUrl}/cestas/${idCesta}/porcentajes`;
    return this.http.get<PorcentajeCesta[]>(url);
  }

  // Obtener las recomendaciones de la cesta desde la API
  obtenerRecomendacionesCesta(idCesta: number): Observable<any> {
    const url = `${this.apiUrl}/cestas/${idCesta}/recomendar`;
    return this.http.get<any>(url);
  }

  // Agregar un producto recomendado a la cesta
  agregarProductoRecomendado(producto: any, cantidad: number): Observable<any> {
    const url = `${this.apiUrl}/cestas/recomendados`;
    return this.http.post(url, {
      ID_prod: producto.ID_prod,
      cantidad: cantidad
      // Puedes incluir otros datos del producto si tu API los necesita
    });
  }

  /**
   * Envía una solicitud DELETE a la API para eliminar un producto específico de una cesta.
   * Asume una URL RESTful como `/cestas-compra/{cestaId}/productos/{productId}`.
   *
   * @param productId El ID del producto a eliminar.
   * @param cestaId El ID de la cesta de la que se eliminará el producto.
   * @returns Un Observable con la respuesta de la API.
   */
  eliminarProductoDeCesta(productId: number): Observable<any> {
    const url = `${this.apiUrl}/cestas-compra/delete-producto/${productId}`;
    return this.http.delete(url);
  }
}