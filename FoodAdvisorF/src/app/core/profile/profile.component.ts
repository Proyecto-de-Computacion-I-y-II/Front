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
  avatar:string = 'https://i.pravatar.cc/150?img=3'

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
  }

  loadUserData() {
    const token = localStorage.getItem('token'); // Obtener el ID del usuario

    if (token) {
      const apiUrl = `http://127.0.0.1:8000/api/usuario/${token}`; // URL de la API

      this.http.get(apiUrl).subscribe({
        next: (data) => {
          this.userData = data; // Guardar datos del usuario
        },
        error: (err) => console.error('Error al obtener el usuario:', err)
      });
    }
  }
}