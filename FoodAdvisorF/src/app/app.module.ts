import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlider, MatSliderRangeThumb } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
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

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { NotFoundComponent } from './not-found/not-found.component';
import { AdminComponent } from './security/admin/admin.component';
import { AuthInterceptor } from './shared/interceptor/auth.interceptor';
import { SubproductosTemporadaComponent } from './subproductos-temporada/subproductos-temporada.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MapComponent } from './core/map/map.component';
import {GoogleMapsModule} from '@angular/google-maps';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AjustesComponent } from './core/ajustes/ajustes.component';

// ✅ IMPORTAR EL SERVICIO Y LA FUNCIÓN FACTORY
import { ConfiguracionService, initializeConfig } from './services/configuracion.service';

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
    MapComponent,
    FooterComponent,
    AjustesComponent
  ],
  imports: [
    MatExpansionModule,
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatFormField,
    FormsModule,
    MatSelect,
    MatOption,
    MatSlider,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSliderRangeThumb,
    MatCardModule,
    MatButtonToggleGroup,
    MatDrawer,
    MatDrawerContainer,
    MatCheckboxModule,
    GoogleMapsModule,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatHeaderRow,
    MatRow,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatListModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // ✅ AÑADIR EL SERVICIO DE CONFIGURACIÓN
    ConfiguracionService,
    // ✅ CONFIGURAR APP_INITIALIZER PARA CARGAR EL COLOR ANTES DE RENDERIZAR
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfig,
      deps: [ConfiguracionService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
