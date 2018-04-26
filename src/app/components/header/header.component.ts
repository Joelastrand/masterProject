
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class HeaderComponent implements OnInit {
  printUsername=null;
  constructor(private router: Router, private authService: AuthService) {

  }

  ngOnInit() {
  }

  logout() {
    localStorage.removeItem("localuserName");
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  isLoggedOut() {
    this.printUsername = localStorage.getItem("localuserName");
    if (this.printUsername == null) {
      return true;
    }
    else
    return false;
  }

  goToStartPage() {
    this.router.navigateByUrl('');
  }
  goToChallengeAFriend() {
    this.router.navigateByUrl('/challengefriend');
  }
  goToCreateAccount() {
    this.router.navigateByUrl('/signup');
  }
  goToLogIn() {
    this.router.navigateByUrl('/login');
  }
  goToDaily() {
    this.router.navigateByUrl('/dailyChallenge');
  }
  goToChallengeView() {
    this.router.navigateByUrl('/challengeview');
  }
  goToSettings() {
    this.router.navigateByUrl('/settings');
  }
}
