import {Component, OnInit} from '@angular/core';
import {CommunicationService} from '../../shared/services/communicacion/communication.service';
import {User} from '../models/user';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../core/services/user/user.service';
import {UserDTO} from '../models/user-dto';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  user: User;

  constructor(private communicationService: CommunicationService, private snackBar: MatSnackBar,
              private userService: UserService, private router: Router) {
    this.user = {} as User;
  }

  ngOnInit() {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/home']).then();
    } else {
      this.communicationService.showHeaderChange({ showHeader: false, logged: false });
    }
  }

  onSubmit() {
    this.snackBar.open("Iniciando sesión");
    this.userService.logIn(this.user).subscribe({
      next: (response: UserDTO) => {
        this.snackBar.dismiss();
        localStorage.setItem('token', response.usuario.ID_user);
        this.router.navigate(['/home']).then();
      },
      error: (e) => {
        this.snackBar.open(e.message, "Entendido", {duration: 2000});
      }
    });
  }
}
