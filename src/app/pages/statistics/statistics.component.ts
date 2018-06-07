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
  challengeWithAFriendList = [];
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

    this.getUserChallengeWithAFriend();
    this.getListOfAchievements();
    this.updateCompletedAchievements();

    this.challengeFriendObservable = this.getUserChallengeFriendList('/scores/' + this.username + '/challengeFriend');
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

  getUserChallengeWithAFriend() {

    this.challengeWithFriendListEmpty = true;

    var setChallengeWithAFriendListNotEmpty = () => {
      this.challengeWithFriendListEmpty = false;
    }

    var addFriendToList = (friendObject) => {
      this.challengeWithAFriendList.push(friendObject);
      setChallengeWithAFriendListNotEmpty();
    };

    let query = "scores/" + this.username + "/challengeWithFriend";
    let currentList = "";
    this.db.database.ref(query).on("value", (snapshot) => {
      snapshot.forEach((snap) => {

        // Saves the friends name and theirs streaks if and push it if they have valid streak
        var key = snap.key;
        var childData = snap.val();
        var friendObject = { name: key, streak: childData["streak"] };

        snap.forEach((childSnap) => {
          var key = childSnap.key;
          var childData = childSnap.val();

          if (key == "date") {

            //Need to check the challenge timestamp to see if it valid or not
            var latestChallengeDate = childData;
            var yesterdaysDate = new Date();
            yesterdaysDate.setDate(yesterdaysDate.getDate() - 1);
            var yesterdayDate = "" + yesterdaysDate.getFullYear() + "-" + (yesterdaysDate.getMonth() + 1) + "-" + (yesterdaysDate.getDate());

            var fridayDate = new Date();
            fridayDate.setDate(fridayDate.getDate() - 3);
            var friday = "" + fridayDate.getFullYear() + "-" + (fridayDate.getMonth() + 1) + "-" + (fridayDate.getDate());

            var d = new Date();
            var weekday = d.getDay();
            var todaysDate = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

            // The streak is valid 
            if (latestChallengeDate == yesterdayDate || latestChallengeDate == todaysDate) {
              addFriendToList(friendObject);
            }

            // Checks if the it is on the weekend, the streaks can not be lost under weekend.
            else if (weekday == 1 && latestChallengeDate == friday || weekday == 0 || weekday == 6) {
              addFriendToList(friendObject);
            }
          }
          return false;
        });
        return false;
      });
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
