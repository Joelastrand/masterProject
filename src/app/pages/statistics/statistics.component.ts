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
  totalScore: number = 0;
  dailyChallengeTotal: number = 0;
  dailyChallengeStreak: number = 0;
  challengeFriendObservable: Observable<any[]>;
  challengeWithFriendObservable: Observable<any[]>;
  showExplanationChallengeWithAFriendDialog: boolean = false;
  showExplanationDailyChallenge: boolean = false;
  showExplanationChallengeAFriendDialog: boolean = false;
  showExplanationScoreDialog: boolean = false;
  challengeFriendListEmpty: boolean = false;
  challengeWithFriendListEmpty: boolean = false;
  listOfAchievements = [];
  max: number = 5000;
  semicircle: boolean = false;
  radius: number = 170;

  constructor(private db: AngularFireDatabase, public auth: AuthService) { }

  ngOnInit() {
    // Make so the page starts on top. 
    window.scrollTo(0, 0);
    this.username = localStorage.getItem("localuserName");
    this.getUserScore();
    this.getUserDailyChallenge();
    this.checkIfChallengeAFriendIsEmpty();
    this.checkIfChallengeWithAFriendIsEmpty();
    this.getListOfAchievements();
    this.updateCompletedAchievements();
    this.challengeFriendObservable = this.getUserChallengeFriendList('/scores/' + this.username + '/challengeFriend');
    this.challengeWithFriendObservable = this.getUserChallengeWithFriendList('/scores/' + this.username + '/challengeWithFriend');
  }

  getOverlayStyle() {
    let isSemi = this.semicircle;
    let transform = (isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

    return {
      //'top': isSemi ? 'auto' : '30%',
      'bottom': isSemi ? '5%' : 'auto',
      'left': '50%',
      'transform': transform,
      '-moz-transform': transform,
      '-webkit-transform': transform,
      'font-size': this.radius / 3.5 + 'px'
    };
  }

  checkIfChallengeAFriendIsEmpty() {
    var setChallengeFriendListEmpty = () => {
      this.challengeFriendListEmpty = true;
    }

    this.db.database.ref("scores/" + this.username + "/challengeFriend").once("value")
      .then(function (snapshot) {
        let numberOfChild = snapshot.numChildren();
        if (numberOfChild == 1) {
          setChallengeFriendListEmpty();
        }
      });
  }


  checkIfChallengeWithAFriendIsEmpty() {
    var setChallengeWithFriendListEmpty = () => {
      this.challengeWithFriendListEmpty = true;
    }

    this.db.database.ref("scores/" + this.username + "/challengeWithFriend").once("value")
      .then(function (snapshot) {
        let numberOfChild = snapshot.numChildren();
        if (numberOfChild == 1) {
          setChallengeWithFriendListEmpty();
        }
      });
  }

  updateCompletedAchievements() {
    let query = "scores/" + this.username + "/achievements";

    var completedAchievement = (achievementName) => {
      this.listOfAchievements.forEach(function (element) {
        if (element.imgName == achievementName) {
          element.completed = true;
        }
      });
    }



    this.db.database.ref(query).once("value")
      .then(function (snapshot) {
        var listOfCompleted = [];
        snapshot.forEach(function (childSnapshot) {

          var key = childSnapshot.key;
          completedAchievement(key);
          return false;
        });
      });

    /*this.db.database.ref(query).on("value", function (snapshot) {
      var listOfCompleted = [];
      snapshot.forEach(function (childSnapshot) {
        
        var key = childSnapshot.key;
        completedAchievement(key);
        return false;
      });
    });*/

  }

  getListOfAchievements() {
    let query = "achievements";

    var addAchievementToList = (achievement) => {
      this.listOfAchievements.push(achievement);
    }

    this.db.database.ref(query).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var childData = childSnapshot.val();
          childData["imgName"] = childSnapshot.key;
          addAchievementToList(childData);
        });
      });

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
    var setUserTotalScoreToVariable = (totalScore) => {
      this.totalScore = totalScore;
    }

    this.db.database.ref("scores/" + this.username + "/points").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "score") {
            setUserScoreToVariable(childData);
          } else {
            setUserTotalScoreToVariable(childData);
          }
        });
      });
  }



}
