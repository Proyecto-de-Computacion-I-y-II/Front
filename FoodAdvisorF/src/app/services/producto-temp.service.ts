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

}