import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';

@Injectable()
export class AchievementCheckerService {

  healthMasterCondition = 10000;
  weeklyGoalCondition = 5000;
  dailyLongStreak = 5;
  oneDaily = 1;
  bestFriendCondition = 10;
  listOfAchievements = [];
  oneFoosball = 1;
  foosballHero = 5;

  constructor(private db: AngularFireDatabase) {

  }

  checkAchievementCompletionStatus(username, achievementName) {

    var achievementExists = false;
    this.db.database.ref("scores/" + username + "/achievements").once("value")
      .then(function (snapshot) {

        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          if (key == achievementName) {
            achievementExists = true;
          }

        });

      });

    return achievementExists;
  }


  checkPointStatus(username, totPoints, currPoints) {
    console.log(username + " " + totPoints + " " + currPoints);
    if (totPoints >= this.healthMasterCondition) {
      if (!this.checkAchievementCompletionStatus(username, "points")) {
        this.db.object(`scores/${username}/achievements`).update({ "points": true });
      }
    }
    if (currPoints >= this.weeklyGoalCondition) {
      if (!this.checkAchievementCompletionStatus(username, "WeeklyGoal")) {
        this.db.object(`scores/${username}/achievements`).update({ "WeeklyGoal": true });
      }

    }
  }

  checkDailyStatus(username, streak) {
    if (streak >= this.oneDaily) {
      if (!this.checkAchievementCompletionStatus(username, "dailychallenge1")) {
        this.db.object(`scores/${username}/achievements`).update({ "dailychallenge1": true });
      }
    }
    if (streak >= this.dailyLongStreak) {
      if (!this.checkAchievementCompletionStatus(username, "dailychallenge5")) {
        this.db.object(`scores/${username}/achievements`).update({ "dailychallenge5": true });
      }

    }
  }


  checkChallengeAFriend(username) {
    if (!this.checkAchievementCompletionStatus(username, "ChallengeaFriend")) {
      this.db.object(`scores/${username}/achievements`).update({ "ChallengeaFriend": true });
    }
  }

  checkChallengeWithFriend(username) {
    if (!this.checkAchievementCompletionStatus(username, "ChallengewithFriend")) {
      this.db.object(`scores/${username}/achievements`).update({ "ChallengewithFriend": true });
    }
  }

  checkBestFriend(user1, user2) {
    /*if (!this.checkAchievementCompletionStatus(username, "ChallengeaFriend")) {
      this.db.object(`scores/${username}/achievements`).update({ "ChallengeaFriend": true });
    }*/

  }

  checkFoosballStatus(username, wins) {
    if (wins >= this.oneFoosball) {
      if (!this.checkAchievementCompletionStatus(username, "foosball")) {
        this.db.object(`scores/${username}/achievements`).update({ "foosball": true });
      }
    }
    if (wins >= this.foosballHero) {
      if (!this.checkAchievementCompletionStatus(username, "FoosballHero")) {
        this.db.object(`scores/${username}/achievements`).update({ "FoosballHero": true });
      }

    }
  }





}
