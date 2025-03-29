import { Injectable } from '@angular/core';
import {API_URL} from '../../configuration/config';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseService<T> {
  basePath: string = API_URL.API;

  constructor(public http: HttpClient) {}

  handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => new Error(error.error.message));
  }
}
