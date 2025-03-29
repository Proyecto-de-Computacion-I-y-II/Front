import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  headerShowed = new EventEmitter<{ showHeader: boolean, logged: boolean }>();

  showHeaderChange(info: { showHeader: boolean, logged: boolean }) {
    this.headerShowed.emit(info);
  }
}
