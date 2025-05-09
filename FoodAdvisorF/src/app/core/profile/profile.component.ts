import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '../../shared/services/communicacion/communication.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  userData: any = null;
  prodUser: number = -1;
  avatar:string = 'https://ui-avatars.com/api/?name=${{this.userData?.nombre}}+${{this.userData?.apellidos}}&background=random&color=fff'

  constructor(private router: Router, private communicationService: CommunicationService, private http: HttpClient) {}

  historialCompras() {
    this.router.navigate(['/cestas'])
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this.communicationService.showHeaderChange({ showHeader: true, logged: false });
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.loadUserData();
    this.loadBuyProducts();
  }

  loadUserData() {
    const token = localStorage.getItem('token');
  
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = `http://127.0.0.1:8000/api/usuario`;
  
      this.http.get(apiUrl, { headers}).subscribe({
        next: (data: any) => {
          this.userData = data;
          this.avatar = `https://ui-avatars.com/api/?name=${data.usuario.nombre}+${data.usuario.apellidos}&background=random&color=fff`;
        },
        error: (err) => console.error('Error al obtener el usuario:', err)
      });
    }
  }
  
  
  loadBuyProducts() {
    const token = localStorage.getItem('token');
  
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = `http://127.0.0.1:8000/api/usuario/productos-totales`;
  
      this.http.get(apiUrl, { headers }).subscribe({
        next: (data: any) => {
          this.prodUser = data.total_comprado;
        },
        error: (err) => {
          console.error('Error al obtener el total de productos comprados:', err);
          this.prodUser = 0;
        }
      });
    }
  }
  

  
  
  
}
