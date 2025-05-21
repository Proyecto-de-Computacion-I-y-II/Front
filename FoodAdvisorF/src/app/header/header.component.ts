import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener,
  Input
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


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

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient
  ) {
    this.setupSpeechRecognition();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();

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

  loadUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get(`${this.apiUrl}/usuario`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (data: any) => {
          this.userData = data;
          this.avatar = `https://ui-avatars.com/api/?name=${data.usuario.nombre}+${data.usuario.apellidos}&background=random&color=fff`;
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