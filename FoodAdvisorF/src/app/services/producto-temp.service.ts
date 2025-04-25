import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProductoTemporada } from '../models/producto-temp';
import { HttpClient } from '@angular/common/http';
import { Observable, ObservedValueOf } from 'rxjs';
import { subscriptionLogsToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root'
})
export class ProductoTempService {

  private apiUrl = environment.apiUrl + '/productos-temp';

  constructor(private http: HttpClient) { }

  getProductosDelMes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }  

  getDetallesPorIdTemp(idTemp: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idTemp}/detalles`);
  }  

  getProductosPorMes(mes: number): Observable<{ mes: string, productos: any[], productossaliendo: any[] }> {
    return this.http.get<{ mes: string, productos: any[], productossaliendo: any[] }>(`${this.apiUrl}/${mes}`);
  }
  
  
}