import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from './../environments/environment';
import { UserService } from './core/services/user/user.service';
import { CommunicationService } from './shared/services/communicacion/communication.service';

declare var webkitSpeechRecognition: any;

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
  isListening = false;
  private apiUrl = environment.apiUrl;

  recognition: any; // Reconocimiento de voz

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

    this.setupSpeechRecognition(); // Inicializa reconocimiento de voz
  }

  ngOnInit(): void {
    this.checkScreenSize();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.hideSearch = currentUrl === '/login' || currentUrl === '/register' || currentUrl === '/inicio';
        this.hideLoginButton = currentUrl === '/login' || currentUrl === '/register';

        this.closeMobileMenu();
        this.closeSearchBar();
        this.checkRouteAccess();
      }
    });

    this.checkRouteAccess();
  }

  setupSpeechRecognition() {
    const SpeechRecognition = (window as any)['SpeechRecognition'] || webkitSpeechRecognition;

    //Configuracion
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.interimResults = false;  //Solo devuelve resultados cuando terminas de hablar
      this.recognition.maxAlternatives = 1; //Solo una interpretacion

      //Recibir resultado
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;  //Guarda el resultado en la variable transcript
        // Muestra en consola lo que el micrófono ha detectado
      console.log('Texto detectado:', transcript);

      // Actualiza la búsqueda con el texto detectado
      this.searchQuery = transcript;
        this.handleSearch();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error de reconocimiento de voz:', event.error);
      };
    }
  }

  startVoiceSearch() {
    if (!this.recognition) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }
  
    if (!this.isListening) {
      this.recognition.start();  // Inicia el reconocimiento de voz
      this.isListening = true;  // Cambia el estado a escuchando
    } else {
      // Detiene el reconocimiento de voz de inmediato y limpia el estado
      this.recognition.abort();  // Usamos abort() para detener inmediatamente el reconocimiento
      this.isListening = false;  // Cambia el estado a no escuchando
  
      // Aseguramos que el estado de "escuchando" se desactive correctamente
      setTimeout(() => {
        this.isListening = false;
      }, 200);  // Ajusta este tiempo según sea necesario
    }
  }  

  checkRouteAccess() {
    const token = localStorage.getItem('token');
    if (!token) {
      const rutasProhibidas = ['/cestas', '/profile'];
      this.showProfile = false;
      const currentUrl = this.router.url;

      if (rutasProhibidas.some(ruta => currentUrl.startsWith(ruta))) {
        this.router.navigate(['/login']);
      }
    } else {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.get(`${this.apiUrl}/usuario`, { headers }).subscribe({
        next: () => this.showProfile = true,
        error: (err) => {
          if (err.status === 401 && err.error?.message === 'El token ha expirado') {
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
      this.closeMobileMenu();
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
    this.searchQuery = '';
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

  ngOnDestroy() {
    if (this.titleChangedSubscription) {
      this.titleChangedSubscription.unsubscribe();
    }
  }
}