import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  searchQuery: string = ''; // Guarda la búsqueda en esta variable
  userName: string = 'Andres ramos garcía';
  hideSearch: boolean = false; // Variable para controlar la visibilidad de la barra de búsqueda
  hideLoginButton: boolean = false; // Variable para controlar la visibilidad del botón de Iniciar Sesión

  constructor(
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef,
    private router: Router // Inyectamos el router
  ) {
    this.showHeader = true;
    this.showProfile = true;

    // Suscripción a cambios en el estado del header
    this.titleChangedSubscription = this.communicationService.headerShowed.subscribe((value) => {
      this.showHeader = value.showHeader;
      this.showProfile = value.logged;
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    // Detectamos la navegación y verificamos si estamos en '/login' o '/register'
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        // Si estamos en '/login' o '/register', ocultamos el search-container y el botón de iniciar sesión
        this.hideSearch = currentUrl === '/login' || currentUrl === '/register';
        this.hideLoginButton = currentUrl === '/login' || currentUrl === '/register';
      }
    });
  }
}