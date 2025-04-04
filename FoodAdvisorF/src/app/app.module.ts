import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatCardModule } from '@angular/material/card';
import { HomeComponent } from './core/home/home.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { LoginComponent } from './security/login/login.component';
import { MatIconModule } from '@angular/material/icon';
import {MatFormField} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatSlider, MatSliderRangeThumb} from '@angular/material/slider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {provideHttpClient} from '@angular/common/http';
import {RegisterComponent} from './security/register/register.component';
import {MatButtonToggleGroup} from '@angular/material/button-toggle';
import { ProfileComponent } from './core/profile/profile.component';
import { CestaComponent } from './core/cesta/cesta.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';
import {NgxPaginationModule} from "ngx-pagination";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    CestaComponent
  ],
    imports: [
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
        ProductoDetalleComponent,
        NgxPaginationModule
    ],
  providers: [
    provideHttpClient()

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
