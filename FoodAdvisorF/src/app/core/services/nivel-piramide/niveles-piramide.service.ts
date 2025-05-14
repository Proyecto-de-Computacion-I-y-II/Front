import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Categoria} from '../../../security/models/categoria';
import {NivelPiramide} from '../../../security/models/nivel-piramide';

@Injectable({
  providedIn: 'root'
})
export class NivelesPiramideService {

  private apiUrl = environment.apiUrl;// API base URL

  constructor(private http: HttpClient) { }

  // Método para obtener categorías en árbol por supermercado
  getNiveles(): Observable<NivelPiramide[]> {
    const url = `${this.apiUrl}/mostrar-niveles`;
    return this.http.get<NivelPiramide[]>(url);
  }


}

