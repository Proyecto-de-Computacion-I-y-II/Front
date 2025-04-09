import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '../../shared/services/communicacion/communication.service';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  userData: any = null;
  prodUser: number = 0;
  avatar:string = 'https://ui-avatars.com/api/?name=${{this.userData?.nombre}}+${{this.userData?.apellidos}}&background=random&color=fff'

  constructor(private router: Router, private communicationService: CommunicationService, private http: HttpClient) {}

  historialCompras() {
    console.log('Historial de compras clickeado');
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
      const apiUrl = `http://127.0.0.1:8000/api/usuario/${token}`;
  
      this.http.get(apiUrl).subscribe({
        next: (data: any) => {
          this.userData = data;
  
          this.avatar = `https://ui-avatars.com/api/?name=${this.userData.usuario.nombre}+${this.userData.usuario.apellidos}&background=random&color=fff`;
        },
        error: (err) => console.error('Error al obtener el usuario:', err)
      });
    }
  }
  

  loadBuyProducts() {
    const token = localStorage.getItem('token');
  
    if (token) {
      const apiUrl = `http://127.0.0.1:8000/api/usuario/get-top-sellers`;
  
      this.http.get(apiUrl).subscribe({
        next: (data) => {
          const rankingData: any[] = data as any[];
          const usuario = rankingData.find((u: any) => u.ID_user == token);
  
          if (usuario) { 
            this.prodUser = usuario.total_comprado;
            console.log(`Has comprado ${this.prodUser} productos.`);
          } else {
            this.prodUser = 0;
            console.warn('Usuario no encontrado en el ranking.');
          }
        },
        error: (err) => console.error('Error al obtener los datos:', err)
      });
    }
  }
  
  
}
