import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
//import { AngularFireDatabase } from 'angularfire2/database';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class StatisticsComponent implements OnInit {
  username: string = "";
  userScore: number = 0;
  dailyChallengeTotal: number = 0;
  dailyChallengeStreak: number = 0;
  challengeFriendObservable: Observable<any[]>;
  challengeWithFriendObservable: Observable<any[]>;
  showExplanationChallengeWithAFriendDialog: boolean = false;
  showExplanationDailyChallenge: boolean = false;
  showExplanationChallengeAFriendDialog: boolean = false;
  showExplanationScoreDialog: boolean = false;


  constructor(private db: AngularFireDatabase, public auth: AuthService) { }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getUserScore();
    this.getUserDailyChallenge();
    this.challengeFriendObservable = this.getUserChallengeFriendList('/scores/' + this.username + '/challengeFriend');
    this.challengeWithFriendObservable = this.getUserChallengeWithFriendList('/scores/' + this.username + '/challengeWithFriend');
  }

  toggleExplanationScore() {
    this.showExplanationScoreDialog == false ? this.showExplanationScoreDialog = true : this.showExplanationScoreDialog = false;
  }
  toggleExplanationChallengeWithAFriendDialog() {
    this.showExplanationChallengeWithAFriendDialog == false ? this.showExplanationChallengeWithAFriendDialog = true : this.showExplanationChallengeWithAFriendDialog = false;
  }
  toggleExplanationChallengeAFriendDialog() {
    this.showExplanationChallengeAFriendDialog == false ? this.showExplanationChallengeAFriendDialog = true : this.showExplanationChallengeAFriendDialog = false;
  }
  toggleExplanationDailyChallenge() {
    this.showExplanationDailyChallenge == false ? this.showExplanationDailyChallenge = true : this.showExplanationDailyChallenge = false;
  }

  getUserChallengeFriendList(listPath): Observable<any[]> {
    return this.db.list(listPath);
  }

  getUserChallengeWithFriendList(listPath): Observable<any[]> {
    return this.db.list(listPath);
  }


  getUserDailyChallenge() {
    var setUserDailyChallengeTotal = (userDailyChallengeTotal) => {
      this.dailyChallengeTotal = userDailyChallengeTotal;
    }

    var setUserDailyChallengeStreak = (userDailyChallengeStreak) => {
      this.dailyChallengeStreak = userDailyChallengeStreak;
    }

    this.db.database.ref("scores/" + this.username + "/dailyChallenge").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "total") {
            setUserDailyChallengeTotal(childData);
          }
          else if (key == "streak") {
            setUserDailyChallengeStreak(childData);
          }
        });
      });

  }
  getUserScore() {

    var setUserScoreToVariable = (userScore) => {
      this.userScore = userScore;
    }

    this.db.database.ref("scores/" + this.username + "/points").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "score") {
            setUserScoreToVariable(childData);
          }
        });
      });
  }



}
