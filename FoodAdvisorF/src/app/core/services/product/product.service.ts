import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  getAllProducts(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    // Set the Authorization header with the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Add the token as a Bearer token
    });

    return this.http.get<any>(this.apiUrl, {headers});
  }

  // Método para obtener un producto por ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}