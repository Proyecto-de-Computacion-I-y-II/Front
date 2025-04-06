import {Component, OnInit} from '@angular/core';
import {User} from '../models/user';
import {CommunicationService} from '../../shared/services/communicacion/communication.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../core/services/user/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  user: User;
  passwordValidator: string;

  constructor(private communicationService: CommunicationService, private snackBar: MatSnackBar,
              private userService: UserService, private router: Router) {
    this.user = {} as User;
    this.passwordValidator = "";
  }

  ngOnInit() {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/home']).then();
    } else {
      this.communicationService.showHeaderChange({ showHeader: true, logged: false });
    }
  }

  register() {
    if (this.passwordValidator == this.user.password) {
      this.snackBar.open("Creando cuenta");
      this.userService.register(this.user).subscribe({
        next: () => {
          this.snackBar.dismiss();
          this.router.navigate(['/login']).then();
        },
        error: (e) => {
          this.snackBar.open(e.message, "Entendido", {duration: 2000});
        }
      });
    } else {
      this.snackBar.open("Las contraseñas deben coincidir", "Entendido", {duration: 2000});
    }
  }
}
