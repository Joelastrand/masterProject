import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { StartComponent } from './pages/start/start.component';
import { ForgotpwComponent } from './pages/forgotpw/forgotpw.component';
import { SetusernameComponent } from './pages/setusername/setusername.component';

const routes: Routes = [

  {
    path: '',
    component: StartComponent
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
    component: HomeComponent
  },
  {
    path: 'about/:id', // /:id = Route parameter
    component: AboutComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
