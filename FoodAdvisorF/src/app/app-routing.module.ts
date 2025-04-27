import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CestaComponent } from './core/cesta/cesta.component';
import { CestasComponent } from './core/cestas/cestas.component';
import { HomeComponent } from './core/home/home.component';
import { ProfileComponent } from './core/profile/profile.component';
import { InicioComponent } from './inicio/inicio.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';
import { LoginComponent } from './security/login/login.component';
import { RegisterComponent } from './security/register/register.component';
import { SubproductosTemporadaComponent } from './subproductos-temporada/subproductos-temporada.component';
import { TemporadaComponent } from './temporada/temporada.component';

const routes: Routes = [
  { path: 'inicio', component: InicioComponent},
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'cestas/:id', component: CestaComponent},
  { path: 'cestas', component: CestasComponent},
  { path: 'producto-detalle/:id', component: ProductoDetalleComponent,
    runGuardsAndResolvers: 'always'
  },
  { path: 'temporada', component: TemporadaComponent},
  { path: 'not-found', component: NotFoundComponent},
  { path: 'subproducto-temporada/:idTemp', component: SubproductosTemporadaComponent},
  { path: '', redirectTo: 'inicio', pathMatch: 'full'},
  { path: '**', redirectTo: 'not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
