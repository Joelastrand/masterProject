import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    window.scrollTo(0,0);
  }

  goDown() {
    window.scrollTo(0, 1000);
  }

  redirectToDailyChallenge() {
    this.router.navigate(['./dailyChallenge']);
  }
  redirectToStatistics() {
    this.router.navigate(['./statistics']);
  }

  redirectToChallengeView() {
    this.router.navigate(['./challengeview']);
  }

}
