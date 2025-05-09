import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { User } from '../../../security/models/user';
import { UserDTO } from '../../../security/models/user-dto';
import { BaseService } from '../../../shared/services/base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<UserDTO>{
  constructor(http: HttpClient) {
    super(http);
    this.basePath = this.basePath + 'usuario';
  }

  logIn(body: User): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.basePath}/login`, { correo: body.email, contrasenia: body.password}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  register(body: User): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.basePath}/register`, { nombre: body.name, apellidos: body.lastName, correo: body.email, contrasenia: body.password, rol: "cliente"}, {
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
}
