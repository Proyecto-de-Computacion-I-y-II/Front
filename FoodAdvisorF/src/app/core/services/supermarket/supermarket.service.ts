import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Categoria} from '../../../security/models/categoria';




@Injectable({
  providedIn: 'root'
})
export class SupermarketService {

  private apiUrl = environment.apiUrl + '/supermercados';// API base URL

  constructor(private http: HttpClient) { }

  // Método para obtener categorías en árbol por supermercado
  getCategoriasArbol(supermercadoId: number): Observable<Categoria[]> {
    const url = `${this.apiUrl}/${supermercadoId}/categorias-arbol`;
    return this.http.get<Categoria[]>(url);
  }


}
