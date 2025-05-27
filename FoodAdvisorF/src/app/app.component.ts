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

    this.loadUserData();


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

  loadUserData() {
    const token = localStorage.getItem('token');

    if (token) {
      const apiUrl = environment.apiUrl + `/usuario`;

      this.http.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
        next: (data: any) => {
          // this.userData = data;
          // this.avatar = `https://ui-avatars.com/api/?name=${data.usuario.nombre}+${data.usuario.apellidos}&background=random&color=fff`;
        },
        error: (err) => console.error('Error al obtener el usuario:', err)
      });
    }
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
        this.searchQuery = transcript;
      console.log('Texto detectado:', transcript);

      // Actualiza la búsqueda con el texto detectado
      this.searchQuery = transcript.charAt(0).toUpperCase() + transcript.slice(1).toLowerCase();  //primera letra mayus
        this.handleSearch();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error de reconocimiento de voz:', event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cdr.detectChanges(); // Para actualizar la vista en angular
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
      console.log();

      // Aseguramos que el estado de "escuchando" se desactive correctamente
      // setTimeout(() => {
      //   this.isListening = false;
      // }, 20);  // Tiempo
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
    // Forzar repintado completo
    document.documentElement.style.setProperty('--search-bg', '#ffffff');

    // Crear un overlay completamente opaco
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.style.backgroundColor = '#ffffff';
    overlay.addEventListener('click', () => this.closeSearchBar());
    document.body.appendChild(overlay);

    this.closeMobileMenu();

    // Asegurar que la barra de búsqueda esté por encima del overlay
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

  // Eliminar overlay
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
    // this.searchQuery = '';  no queremos que se limpie la barra despues de la busqueda
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

  irPerfil(){
    this.router.navigate(['/profile']);
  }

  ngOnDestroy() {
    if (this.titleChangedSubscription) {
      this.titleChangedSubscription.unsubscribe();
    }
  }
}
