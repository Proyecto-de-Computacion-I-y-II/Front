import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../security/models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiUrl + '/productos';

  constructor(private http: HttpClient) {}

  // Método para obtener todos los productos
  getAllProducts(currentPage: number): Observable<any> {
    return this.http.get<any>(this.apiUrl+'?page='+currentPage);
  }

  // Método para obtener los productos similares a otro
  getProductsSimillarTo(id: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/productos-sim/${id}`);
  }

  // Método para obtener un producto por ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  static supermercadoDiccionario: Record<number, string> = {
    1: 'Eroski',
    2: 'Carrefour',
    3: 'Dia',
    4: 'Mercadona'
  };

  // Método estático para obtener el nombre del supermercado
  static getSupermercadoNombre(idSuper: number): string {
    return ProductService.supermercadoDiccionario[idSuper] || 'Desconocido';
  }

  getSuperByProductId(id: number): Observable<{ supermercado: string }> {
    return this.http.get<{ supermercado: string }>(`${this.apiUrl}/${id}/super`);
  }

  getValoresMaximos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/valores-max`);
  }


}
