import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from './core/home/home.component';
import {LoginComponent} from './security/login/login.component';
import {RegisterComponent} from './security/register/register.component';
import {ProfileComponent} from './core/profile/profile.component';
import { CestaComponent } from './core/cesta/cesta.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';
import { TemporadaComponent } from './temporada/temporada.component';
import { CestasComponent } from './core/cestas/cestas.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'cestas/:id', component: CestaComponent},
  { path: 'cestas', component: CestasComponent},
  { path: 'producto-detalle/:id', component: ProductoDetalleComponent},
  { path: 'temporada', component: TemporadaComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
