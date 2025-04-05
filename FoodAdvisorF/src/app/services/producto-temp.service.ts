import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProductoTemporada } from '../models/producto-temp';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoTempService {

  private apiUrl = environment.apiUrl + '/productos-temp';

  constructor(private http: HttpClient) { }

  // Obtener todos los productos de temporada sin paginación
  getAllProductosTemp(): Observable<ProductoTemporada[]> {
    return this.http.get<ProductoTemporada[]>(this.apiUrl); // Llamada sin paginación
  }

  // Obtener un producto específico por su ID
  getProductoTempById(id: string): Observable<ProductoTemporada> {
    return this.http.get<ProductoTemporada>(`${this.apiUrl}/${id}`);
  }
}