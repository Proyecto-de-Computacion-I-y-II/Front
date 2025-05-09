import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '../../shared/services/communicacion/communication.service';
import { UserService } from '../services/user/user.service';

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
  showDeleteConfirmation: boolean = false;

  constructor(private router: Router, private communicationService: CommunicationService, private http: HttpClient, private userService: UserService) {}

  eliminarCuenta() {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.eliminarCuenta(token).subscribe({
        next: (response) => {
          console.log('Cuenta eliminada:', response);
          this.cerrarSesion();
        },
        error: (error) => {
          console.error('Error al eliminar la cuenta:', error);
        }
      });
    } else {
      console.error('No se encontró el token en localStorage');
    }
  }

  closeConfirmationOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('confirmation-overlay')) {
      this.showDeleteConfirmation = false;
    }
  }

  cancelarEliminacion() {
    this.showDeleteConfirmation = false;
  }

  confirmarEliminarCuenta() {
    this.showDeleteConfirmation = true;
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
      const apiUrl = `http://127.0.0.1:8000/api/usuario`;
  
      this.http.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
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
