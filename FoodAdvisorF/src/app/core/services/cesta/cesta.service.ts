import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { Cesta } from './../../../security/models/cesta';
import { Observable } from 'rxjs';

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

  // Agregar un producto al carrito (envía una petición POST a la API)
  agregarProductoAlCarrito(producto: any, cantidad: number) {
    this.http.post<Cesta>(`${this.apiUrl}/cestas-compra/addProducto`, {
      ID_prod: producto.ID_prod,
      cantidad: cantidad
    }).subscribe({
      next: (resp) => {
        this.snackBar.open("Producto añadido", "Entendido", { duration: 2000 });
        // Podrías actualizar this.productosEnCesta aquí si la API devuelve la cesta actualizada
      },
      error: (err) => {
        this.snackBar.open("No se ha podido añadir el producto a la cesta. Pruebe más tarde", "Entendido", { duration: 2000 });
        console.log(err.message)
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
}