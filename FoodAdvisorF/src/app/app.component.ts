import {ChangeDetectorRef, Component} from '@angular/core';
import {Subscription} from 'rxjs';
import {CommunicationService} from './shared/services/communicacion/communication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  showHeader: boolean;
  showProfile: boolean;
  titleChangedSubscription: Subscription;
  searchQuery: string = ''; // Guarda la búsqueda en esta variable
  userName: string = 'Andrés Ramos García';

  constructor(private communicationService: CommunicationService, private cdr: ChangeDetectorRef) {
    this.showHeader = true;
    this.showProfile = true;
    this.titleChangedSubscription = this.communicationService.headerShowed.subscribe((value) => {
      this.showHeader = value.showHeader;
      this.showProfile = value.logged;
      this.cdr.detectChanges();
    });
  }
}
