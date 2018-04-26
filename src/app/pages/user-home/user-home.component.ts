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
  }

  redirectToDailyChallenge() {
    this.router.navigate(['./dailyChallenge']);
  }
  redirectToStatistics() {
    this.router.navigate(['./statistics']);
  }

  redirectToChallengeFriend() {
    this.router.navigate(['./challengefriend']);
  }

}
