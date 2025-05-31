import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, Observable} from 'rxjs';
import { User } from '../../../security/models/user';
import { UserDTO } from '../../../security/models/user-dto';
import { BaseService } from '../../../shared/services/base/base.service';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<UserDTO>{
  constructor(http: HttpClient) {
    super(http);
    this.basePath = environment.apiUrl + '/usuario';
  }

  logIn(body: User): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.basePath}/login`, { correo: body.email, contrasenia: body.password}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  register(body: User): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.basePath}/register`, { nombre: body.name, apellidos: body.lastName, correo: body.email, contrasenia: body.password, rol: "comprador"}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  eliminarCuenta(token: string): Observable<any> {
    return this.http.delete(`${this.basePath}/delete`).pipe(
      catchError(this.handleError)
    );
  }
  private sessionChanged = new BehaviorSubject<boolean>(false);
  sessionChanged$ = this.sessionChanged.asObservable();

  notifySessionChange() {
    this.sessionChanged.next(true);
  }

}
