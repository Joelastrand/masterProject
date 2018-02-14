import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {


  constructor() { }

  ngOnInit() {
  }

  goToDailyChallenge(): void {
    alert("Under construction, should go to the daily challenge page");
  }
  goToChallengeAFriend(): void {
    alert("Under construction, should go to the Challenge a friend page");
  }
  goToStatistics(): void {
    alert("Under construction, should go to the statistics page");
  }
}
