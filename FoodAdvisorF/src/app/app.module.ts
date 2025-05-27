import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import localeEs from '@angular/common/locales/es';

import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CestaComponent } from './core/cesta/cesta.component';
import { CestasComponent } from './core/cestas/cestas.component';
import { HomeComponent } from './core/home/home.component';
import { ProfileComponent } from './core/profile/profile.component';
import { InicioComponent } from './inicio/inicio.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';
import { LoginComponent } from './security/login/login.component';
import { RegisterComponent } from './security/register/register.component';
import { TemporadaComponent } from './temporada/temporada.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AdminComponent } from './security/admin/admin.component';
import { SubproductosTemporadaComponent } from './subproductos-temporada/subproductos-temporada.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AjustesComponent } from './core/ajustes/ajustes.component';
import { StatsAdminComponent } from './core/stats-admin/stats-admin.component';
import { MapComponent } from './core/map/map.component';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { GoogleMapsModule } from '@angular/google-maps';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ConfiguracionService, initializeConfig } from './services/configuracion.service';
import { AuthInterceptor } from './shared/interceptor/auth.interceptor';

registerLocaleData(localeEs, 'es-ES');

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    CestaComponent,
    CestasComponent,
    TemporadaComponent,
    InicioComponent,
    ProductoDetalleComponent,
    SubproductosTemporadaComponent,
    NotFoundComponent,
    AdminComponent,
    HeaderComponent,
    FooterComponent,
    AjustesComponent,
    StatsAdminComponent,
    MapComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule, 
    RouterModule,
    AppRoutingModule,
    FormsModule,

    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,

    GoogleMapsModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ConfiguracionService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfig,
      deps: [ConfiguracionService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}