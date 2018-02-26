import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ViewChild } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { DataService } from './data.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { StartComponent } from './pages/start/start.component';
import { SetusernameComponent } from './pages/setusername/setusername.component';
import { ForgotpwComponent } from './pages/forgotpw/forgotpw.component';
import { DailychallengeComponent } from './pages/dailychallenge/dailychallenge.component';

// PrimeNG components
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import {DialogModule} from 'primeng/dialog';

// Material components
import { MaterialModule } from './material.module';
import {MatToolbarModule} from '@angular/material/toolbar';

// Our components
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';



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
    LoginComponent,
    SignupComponent,
    HeaderComponent,
    StartComponent,
    ForgotpwComponent,
    SetusernameComponent,
    LeaderboardComponent,
    FooterComponent,
    DailychallengeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    AngularFireAuthModule,

    // PrimeNG components
    ButtonModule,
    GalleriaModule,
    DialogModule,

    //ConfirmationService,

    // Material components
    MaterialModule,
    MatToolbarModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent]

})
export class AppModule { }
