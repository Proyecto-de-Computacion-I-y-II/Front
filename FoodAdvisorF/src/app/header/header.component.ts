import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ConfiguracionService } from '../services/configuracion.service';
import {UserService} from '../core/services/user/user.service'; // ✅ IMPORTAR EL SERVICIO

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() showHeader: boolean = true;
  searchQuery: string = '';
  showProfile: boolean = false;
  hideSearch: boolean = false;
  hideLoginButton: boolean = false;
  showMobileMenu: boolean = false;
  showSearchBar: boolean = false;
  isMobileView: boolean = false;
  isListening = false;
  userData: any = null;
  avatar: string = '';
  private apiUrl = environment.apiUrl;
  recognition: any;
  isChromeBrowser: boolean = false;
  headerBackgroundColor: string = '#FFFFFF';
  profileIsAdmin: boolean = false; // Para verificar si el usuario es administrador

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private configuracionService: ConfiguracionService,
    private userService: UserService,
  ) {
    this.checkIfChrome();
    this.setupSpeechRecognition();
  }

  ngOnInit(): void {
    this.headerBackgroundColor = this.configuracionService.getHeaderColor();

    this.updateHeaderColorFromService();

    this.checkIfChrome();
    this.checkScreenSize();
    this.userService.sessionChanged$.subscribe(() => {
      this.loadUserData(); // <-- recarga los datos cuando cambia la sesión
    });

    console.log('¿Es Chrome?', this.isChromeBrowser);
    console.log('Color del header:', this.headerBackgroundColor);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.hideSearch = ['/login', '/register', '/inicio'].includes(currentUrl);
        this.hideLoginButton = ['/login', '/register'].includes(currentUrl);

        this.closeMobileMenu();
        this.closeSearchBar();
        this.checkRouteAccess();
      }
    });
  }

  private updateHeaderColorFromService(): void {
    // Esto asegura que el componente tenga el color más actualizado
    setTimeout(() => {
      this.headerBackgroundColor = this.configuracionService.getHeaderColor();
      this.cdr.detectChanges(); // Forzar detección de cambios
      console.log('🎨 Color del header actualizado desde servicio:', this.headerBackgroundColor);
    }, 100);
  }
  checkIfChrome() {
    const ua = navigator.userAgent;
    const isChrome = /Chrome/.test(ua) && !/Edg|OPR|Opera/.test(ua);

    const isBraveCandidate = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
    //navigator es un objeto del navegador que contiene info sobre el mismo
    //Brave agrega su propia propiedad especial: navigator.brave
    //navigator.brave.isBrave() es una función que solo existe en Brave y devuelve una promesa que
    //se resuelve con true si es Brave y con false si no lo es (aunque es poco común)

    if (isBraveCandidate) {
      (navigator as any).brave.isBrave().then((isBrave: boolean) => { //se maneja la promesa
        this.isChromeBrowser = isChrome && !isBrave;  //se asigna SOLO si es chrome
        this.cdr.detectChanges(); // Asegura que Angular actualice la vista si cambia el valor
      });
    } else {
      this.isChromeBrowser = isChrome;
    }
  }

  loadUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get(`${this.apiUrl}/usuario`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (data: any) => {
          this.userData = data;
          const nombre = encodeURIComponent(data.usuario.nombre || '');
          const apellidos = encodeURIComponent(data.usuario.apellidos || '');
          this.avatar = `https://ui-avatars.com/api/?name=${nombre}+${apellidos}&background=random&color=fff`;
          this.profileIsAdmin = data.usuario.rol === 'admin'; // Verifica si el usuario es administrador
          console.log('Datos del usuario cargados:', this.userData);
          this.showProfile = true;
        },
        error: () => {
          this.showProfile = false;
        }
      });
    }
  }

  setupSpeechRecognition() {
    const SpeechRecognition = (window as any)['SpeechRecognition'] || webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.searchQuery = transcript.charAt(0).toUpperCase() + transcript.slice(1).toLowerCase();
        this.handleSearch();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error de reconocimiento de voz:', event.error);

        if (event.error === 'network') {
          alert('Error de red: Verifica tu conexión a Internet.');
        } else if (event.error === 'not-allowed') {
          alert('Permiso denegado: Debes permitir el acceso al micrófono.');
        } else if (event.error === 'no-speech') {
          alert('No se detectó voz. Intenta hablar de nuevo.');
        } else {
          alert(`Error del reconocimiento de voz: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cdr.detectChanges();
      };
    }
  }

  startVoiceSearch() {
    if (!this.recognition) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
    } else {
      this.recognition.stop();
    }
  }

  checkRouteAccess() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showProfile = false;
      const restrictedRoutes = ['/cestas', '/profile'];
      const currentUrl = this.router.url;
      if (restrictedRoutes.some(route => currentUrl.startsWith(route))) {
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

  @HostListener('window:resize')
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
      const overlay = document.createElement('div');
      overlay.className = 'search-overlay';
      overlay.style.backgroundColor = '#ffffff';
      overlay.addEventListener('click', () => this.closeSearchBar());
      document.body.appendChild(overlay);

      this.closeMobileMenu();

      setTimeout(() => {
        const searchContainer = document.querySelector('.search-container-mobile');
        if (searchContainer) {
          (searchContainer as HTMLElement).style.zIndex = '9999';
        }

        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 50);
    } else {
      this.closeSearchBar();
    }
  }

  closeSearchBar() {
    this.showSearchBar = false;
    document.body.classList.remove('search-active');

    const overlay = document.querySelector('.search-overlay');
    if (overlay) {
      overlay.remove();
    }
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

  irPerfil() {
    this.router.navigate(['/profile']);
  }
}
