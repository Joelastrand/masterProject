import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  leaderboardObservable: Observable<any[]>;
  
  constructor(private db:AngularFireDatabase) { }

  ngOnInit() {
    this.leaderboardObservable = this.getLeaderboard('/leaderboard/users');
  }

  getLeaderboard(listPath): Observable<any[]> {
    return this.db.list(listPath).valueChanges();
  }
}
