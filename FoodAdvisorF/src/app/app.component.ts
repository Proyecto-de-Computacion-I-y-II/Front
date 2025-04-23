import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from './../environments/environment';
import { UserService } from './core/services/user/user.service';
import { CommunicationService } from './shared/services/communicacion/communication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showHeader: boolean;
  showProfile: boolean;
  titleChangedSubscription: Subscription;
  searchQuery: string = '';
  userName: string = 'Food-Advisor';
  hideSearch: boolean = false;
  hideLoginButton: boolean = false;
  showMobileMenu: boolean = false;
  showSearchBar: boolean = false;
  isMobileView: boolean = false;
  showDeleteConfirmation: boolean = false;
  private apiUrl = environment.apiUrl;

  constructor(
    private userService: UserService,
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient
  ) {
    this.showHeader = true;
    this.showProfile = true;
    
    this.titleChangedSubscription = this.communicationService.headerShowed.subscribe((value) => {
      this.showHeader = value.showHeader;
      this.showProfile = value.logged;
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
  
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.hideSearch = currentUrl === '/login' || currentUrl === '/register' || currentUrl === '/inicio';
        this.hideLoginButton = currentUrl === '/login' || currentUrl === '/register';
  
        // Cerrar menús al navegar
        this.closeMobileMenu();
        this.closeSearchBar();
        this.checkRouteAccess();
      }
    });
    this.checkRouteAccess();
  }

  checkRouteAccess() {
    const token = localStorage.getItem('token');

    if (!token) {
      const rutasProhibidas = ['/cestas', '/profile'];
      this.showProfile = false;
      const currentUrl = this.router.url;

      // Redirect to login if trying to access restricted routes
      if (rutasProhibidas.some(ruta => currentUrl.startsWith(ruta))) {
        this.router.navigate(['/login']);
      }
    } else {
      // If token exists, check user info
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      this.http.get(`${this.apiUrl}/usuario`, { headers }).subscribe({
        next: (res) => {
          this.showProfile = true;
        },
        error: (err) => {
          if (err.status === 401 && err.error?.message == 'El token ha expirado') {
            this.showProfile = false;
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth < 1280;
    if (!this.isMobileView) {
      this.closeMobileMenu();
      this.closeSearchBar();
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      this.closeSearchBar();
    }
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  toggleSearchBar() {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      // Enfocar el input de búsqueda cuando se muestra
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  closeSearchBar() {
    this.showSearchBar = false;
  }

  handleSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/home'], { 
        queryParams: { search: this.searchQuery } 
      });
      this.closeSearchBar();
    }
  }

  onSearchKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.handleSearch();
    } else if (event.key === 'Escape') {
      this.closeSearchBar();
    }
  }

  goToCesta(): void {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/cesta']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  
  // Método para mostrar el diálogo de confirmación
  confirmDeleteCart(): void {
    this.showDeleteConfirmation = true;
  }
  
  // Método para cancelar la eliminación
  cancelDeleteCart(): void {
    this.showDeleteConfirmation = false;
  }
  
  // Método para confirmar y proceder con la eliminación
  acceptDeleteCart(): void {
    const token = localStorage.getItem('token');
    
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      
      // Llamada a la API para vaciar la cesta
      this.http.delete(`${this.apiUrl}/cesta/vaciar`, { headers }).subscribe({
        next: (response) => {
          // Notificar al usuario que la operación fue exitosa
          console.log('Cesta vaciada correctamente');
          
          // Opcional: Puedes emitir un evento para actualizar otros componentes
          // this.communicationService.notifyCartUpdated();
          
          // Cerrar el diálogo de confirmación
          this.showDeleteConfirmation = false;
          
          // Redirigir al usuario a la página de inicio o actualizar la página actual
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error al vaciar la cesta:', error);
          
          // Mostrar mensaje de error al usuario
          alert('Ha ocurrido un error al intentar vaciar la cesta. Por favor, inténtalo de nuevo.');
          
          // Cerrar el diálogo de confirmación
          this.showDeleteConfirmation = false;
        }
      });
    } else {
      // Si no hay token, redirigir al login
      this.router.navigate(['/login']);
    }
  }
  
  // Método para cerrar el diálogo si se hace clic fuera
  closeConfirmationOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('confirmation-overlay')) {
      this.showDeleteConfirmation = false;
    }
  }
  
  ngOnDestroy() {
    if (this.titleChangedSubscription) {
      this.titleChangedSubscription.unsubscribe();
    }
  }
}
