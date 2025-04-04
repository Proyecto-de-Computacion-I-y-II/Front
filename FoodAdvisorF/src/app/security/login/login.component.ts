import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user/user.service';
import { CommunicationService } from '../../shared/services/communicacion/communication.service';
import { User } from '../models/user';
import { UserDTO } from '../models/user-dto';

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
      this.communicationService.showHeaderChange({ showHeader: true, logged: false });
    }
  }

  onSubmit() {
    this.snackBar.open("Iniciando sesión");
    this.userService.logIn(this.user).subscribe({
      next: (response: UserDTO) => {
        this.snackBar.dismiss();
        localStorage.setItem('token', response.token);
        this.router.navigate(['/home']).then();
      },
      error: (e) => {
        const errorMessage = e.error?.message || "Ocurrió un error. Por favor, intenta de nuevo.";
        this.snackBar.open(errorMessage, "Entendido", {duration: 2000});
      }
    });
  }
}
