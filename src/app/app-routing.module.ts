import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { StartComponent } from './pages/start/start.component';
import { ForgotpwComponent } from './pages/forgotpw/forgotpw.component';
import { SetusernameComponent } from './pages/setusername/setusername.component';
import { DailychallengeComponent } from './pages/dailychallenge/dailychallenge.component';
import { UserHomeComponent } from './pages/user-home/user-home.component';
import { ChallengefriendComponent } from './pages/challengefriend/challengefriend.component';
import { ChallengeviewComponent } from './pages/challengeview/challengeview.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { HealthInformationComponent } from './pages/health-information/health-information.component';
import { GameInformationComponent } from './pages/gameinformation/gameinformation.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ChallengeWithFriendComponent } from './pages/challengeWithFriend/challengeWithFriend.component';
import { ChallengeViewWithFriendComponent } from './pages/challengeViewWithFriend/challengeViewWithFriend.component';

const routes: Routes = [

  {
    path: '',
    component: StartComponent
  },
  {
    path: 'challengeWithFriend',
    component: ChallengeWithFriendComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'gameInformation',
    component: GameInformationComponent
  },
  {
    path: 'statistics',
    component: StatisticsComponent
  },
  {
    path: 'health',
    component: HealthInformationComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'setusername',
    component: SetusernameComponent
  },
  {
    path: 'forgotpassword',
    component: ForgotpwComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'home',
    component: UserHomeComponent
    //component: HomeComponent
  },
  {
    path: 'dailyChallenge',
    component: DailychallengeComponent
  },
  {
    path: 'challengeview',
    component: ChallengeviewComponent
  },
  {
    path: 'challengeViewWithFriend',
    component: ChallengeViewWithFriendComponent
  },

  {
    path: 'challengefriend',
    component: ChallengefriendComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
