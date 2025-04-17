import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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

  constructor(
    private userService: UserService,
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef,
    private router: Router
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
      }
    });


    if(!localStorage.getItem('token')){
      this.showProfile = false;
    }

  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth < 768;
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
  
  ngOnDestroy() {
    if (this.titleChangedSubscription) {
      this.titleChangedSubscription.unsubscribe();
    }
  }
}
