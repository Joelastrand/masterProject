import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { DataService } from './data.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';

// PrimeNG components
import { ButtonModule } from 'primeng/button';


export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDpbX5w7IVK3r7-nRfyzdPiowJc-M3J5cY",
  authDomain: "masterproject-e39ce.firebaseapp.com",
  databaseURL: "https://masterproject-e39ce.firebaseio.com",
  projectId: "masterproject-e39ce",
  storageBucket: "masterproject-e39ce.appspot.com",
  messagingSenderId: "459444280112"
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    // PrimeNG components
    ButtonModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent]

})
export class AppModule { }
