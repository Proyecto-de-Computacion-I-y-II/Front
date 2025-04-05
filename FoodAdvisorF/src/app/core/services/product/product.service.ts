import { Injectable } from '@angular/core';
import {BaseService} from '../../../shared/services/base/base.service';
import {UserDTO} from '../../../security/models/user-dto';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, Observable, retry} from 'rxjs';
import {Product} from '../../../security/models/product';
import { environment } from '../../../../environments/environment';

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
}
