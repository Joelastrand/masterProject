import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ViewChild } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';


import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

// Services
import { UserService } from './service/user.service'
import { DataService } from './data.service';
import { AuthService } from './auth.service';


//Directives 
import { ClickOutsideDirective } from './dropdown.directive';

import { SearchFilterPipe } from './filter-pipe';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { StartComponent } from './pages/start/start.component';
import { SetusernameComponent } from './pages/setusername/setusername.component';
import { ForgotpwComponent } from './pages/forgotpw/forgotpw.component';
import { DailychallengeComponent } from './pages/dailychallenge/dailychallenge.component';
import { ChallengefriendComponent } from './pages/challengefriend/challengefriend.component';
import { UserHomeComponent } from './pages/user-home/user-home.component';
import { ChallengeviewComponent } from './pages/challengeview/challengeview.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { HealthInformationComponent } from './pages/health-information/health-information.component';
import { GameInformationComponent } from './pages/gameinformation/gameinformation.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ChallengeWithFriendComponent } from './pages/challengeWithFriend/challengeWithFriend.component';
import { ChallengeViewWithFriendComponent } from './pages/challengeViewWithFriend/challengeViewWithFriend.component';

//Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// PrimeNG components
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';

// Material components
import { MaterialModule } from './material.module';
import { MatToolbarModule } from '@angular/material/toolbar';

//Other components
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SimpleTimer } from 'ng2-simple-timer';
import { ToastrModule } from 'ngx-toastr';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

// Our components
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { CarouselComponent } from './components/carousel/carousel.component';





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
    LoginComponent,
    SignupComponent,
    HeaderComponent,
    StartComponent,
    ForgotpwComponent,
    SetusernameComponent,
    LeaderboardComponent,
    FooterComponent,
    DailychallengeComponent,
    CarouselComponent,
    UserHomeComponent,
    ChallengefriendComponent,
    ChallengeviewComponent,
    StatisticsComponent,
    HealthInformationComponent,
    GameInformationComponent,
    SettingsComponent,
    ClickOutsideDirective,
    SearchFilterPipe,
    ChallengeWithFriendComponent,
    ChallengeViewWithFriendComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    NgbModule.forRoot(),
   
    // PrimeNG components
    ButtonModule,
    GalleriaModule,
    DialogModule,

    //ConfirmationService,

    // Material components
    MaterialModule,
    MatToolbarModule,
     
    //Other components
    RoundProgressModule,
    NgCircleProgressModule.forRoot({
      //Default settings for progress circle
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
      title: "hej"
    }),
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 100000,
      positionClass: 'toast-center-center',
      preventDuplicates: true,
      enableHtml: true,
    }),
  ],
  providers: [
    DataService,
    UserService,
    AuthService,
    SimpleTimer
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
