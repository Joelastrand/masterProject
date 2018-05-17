import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-challengeViewWithFriend',
  templateUrl: './challengeViewWithFriend.component.html',
  styleUrls: ['./challengeViewWithFriend.component.scss'],
  providers: [AuthService, AngularFireDatabase]

})
export class ChallengeViewWithFriendComponent implements OnInit {

  username: string = "";
  ListOfIncomingChallenges = [];
  ListOfOutgoingChallenges = [];
  ListOfCurrentChallenges = [];
  selectedChallenge: string = "";
  challengerName: string = "";
  challengeDescription: string = "";
  challengeObject: Observable<String>;
  userCurrentScore: number = 0;
  opponentCurrentScore: number = 0;
  userAndFriendCurrentStreak: number = 0;
  opponentCurrentVictories: number = 0;
  challengeFind: boolean = false;
  counterChild: number = 1;
  showExplanationDialog: boolean = false;

  constructor(private toastr: ToastrService, private db: AngularFireDatabase, public auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getUserChallenges();
  }

  toggleExplanationDialog() {
    this.showExplanationDialog == false ? this.showExplanationDialog = true : this.showExplanationDialog = false;
  }



  sendChallengeCompleted() {

    var giveTheUserPoints = () => {
      // Give the optional parameter a value so we can update only the user.
      getUserAndFriendCurrentScore(1);
    }

    var updateChallengeStatus = () => {
      this.db.object(`userChallengesWithFriend/${this.username}/current/${this.challengerName}`).update({ "challengeStatus": "completed" });
      this.toastr.success('You have chosen that you completed the challenge!', 'Challenge With a Friend');
    }

    // If the user does not have this challenge we create the challenge and give the user one points.
    var createFriendStreak = () => {
      var d = new Date();
      var date = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

      this.db.object(`scores/${this.username}/challengeWithFriend/`).update({ [this.challengerName]: { "name": this.challengerName, "streak": 1, "date": date } });
      this.db.object(`scores/${this.challengerName}/challengeWithFriend/`).update({ [this.username]: { "name": this.username, "streak": 1, "date": date } });
    }

    var updateUserAndFriendCurrentStreak = (streak) => {
      var d = new Date();
      var date = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());
      var updateStreak = false;
      this.db.database.ref("scores/" + this.username + "/challengeFriend/" + this.username + "/date").once("value")
        .then(function (snapshot) {
          if (new Date(snapshot.val()).getTime() != new Date(date).getTime()) {
            return updateStreak = true;
          } else {
            return updateStreak = false;
          }
        });
      if (updateStreak) {
        this.userAndFriendCurrentStreak = streak
        this.userAndFriendCurrentStreak = this.userAndFriendCurrentStreak + 1;
        this.db.object(`scores/${this.username}/challengeWithFriend/${this.challengerName}`).update({ "streak": this.userAndFriendCurrentStreak });
        this.db.object(`scores/${this.challengerName}/challengeWithFriend/${this.username}`).update({ "streak": this.userAndFriendCurrentStreak });
      }

      this.userAndFriendCurrentStreak = 0;
    }

    var compareChildToFindFriendStreak = (friend) => {

      this.db.database.ref("scores/" + this.username + "/challengeWithFriend/" + friend).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "streak") {
              if (childData == undefined) {
                childData = 0;
              }
              updateUserAndFriendCurrentStreak(childData);
            }
          });
        });
    }

    var compareChildToFriends = (key, numberOfChild) => {
      // Need to counter the child so we can create a challenge if it is neccessary. 
      // The counterChild starts on 1 because it the field challengeFriend has one child from beginning
      // go file setusername.ts to see which attributes that is given to the user from start. 
      this.counterChild = this.counterChild + 1;

      // if we find the friend, we will update the streaks at the user and the friend. 
      if (key == this.challengerName) {
        compareChildToFindFriendStreak(key)
        // This means that we don't need to create a the friend, it already exist.
        this.challengeFind = true;
      }

      // Creates a friend if the user does not has this friend yet. Important that we have loop 
      // through all the children first. 
      else if (this.challengeFind == false && numberOfChild == this.counterChild) {
        createFriendStreak();
      }
    }


    var checkIfUserAndFriendHasAStreak = () => {

      this.db.database.ref("scores/" + this.username + "/challengeWithFriend").once("value")
        .then(function (snapshot) {
          let numberOfChild = snapshot.numChildren();

          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            compareChildToFriends(key, numberOfChild);
          });
        });
    }

    // Function that sets the user and the friend current score to a variable and
    // updating both with 350 points.
    var updateUserAndFriendCurrentScore = (currentScore, whichUser,challengePoints, OnlyUserCompleted = 0) => {

        // The user
        if (whichUser == 1 && OnlyUserCompleted == 0) {
          this.userCurrentScore = currentScore
          this.userCurrentScore = this.userCurrentScore + challengePoints;
          this.db.object(`scores/${this.username}/points`).update({ "score": this.userCurrentScore });
          this.toastr.success('Execellent work! You and ' + this.challengerName + ' completed the challenge. Both of you get ' + challengePoints + ' points.', 'Challenge With a Friend');
        }

      if (whichUser == 1 && OnlyUserCompleted == 1) {
        this.userCurrentScore = currentScore
        this.userCurrentScore = this.userCurrentScore + 200;
        this.db.object(`scores/${this.username}/points`).update({ "score": this.userCurrentScore });
        this.toastr.success('Awesome work to completed the challenge! However your friend failed to completed:( But no worries, you get 200 points for the challenge anyway.', 'Challenge With a Friend');

      }

      // The Friend
      else if (whichUser == 2 && OnlyUserCompleted == 0) {
        this.opponentCurrentScore = currentScore
        this.opponentCurrentScore = this.opponentCurrentScore + challengePoints;
        this.db.object(`scores/${this.challengerName}/points`).update({ "score": this.opponentCurrentScore });
      }

    }

    var getChallengeLevelBeforeUpdate = (score, whichUser, OnlyUserCompleted) => {
      this.db.database.ref("challenges/challengeWithFriend/" + this.selectedChallenge).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "level") {
              if (childData == "hard") {
                childData = 400;
              }
              else if (childData == "medium") {
                childData = 300; 
              }
              else  {
                childData = 200; 
              }
              updateUserAndFriendCurrentScore(score, whichUser, childData, OnlyUserCompleted);
              //updateUserAndFriendCurrentScore(childData, 1, OnlyUserCompleted);
            }
          });
        });
    }

    // Function that get the user and the friend current score and send 
    //it to updateUserAndFriendCurrentScore. 
    var getUserAndFriendCurrentScore = (OnlyUserCompleted = 0) => {
      // For the user
      this.db.database.ref("scores/" + this.username + "/points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "score") {
              if (childData == undefined) {
                childData = 0;
              }
              getChallengeLevelBeforeUpdate(childData, 1, OnlyUserCompleted);
              //updateUserAndFriendCurrentScore(childData, 1, OnlyUserCompleted);
            }
          });
        });
      // For the opponent
      this.db.database.ref("scores/" + this.challengerName + "/points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "score") {
              if (childData == undefined) {
                childData = 0;
              }
              getChallengeLevelBeforeUpdate(childData, 2, OnlyUserCompleted);
            }
          });
        });
    }

    var resetVariables = () => {
      this.challengeFind = false;
      this.counterChild = 0;
    }

    var deleteCurrentChallenge = () => {
      this.db.object(`userChallengesWithFriend/${this.username}/current/${this.challengerName}`).remove();
      this.db.object(`userChallengesWithFriend/${this.challengerName}/current/${this.username}`).remove();
      this.router.navigateByUrl('/');
    }

    // Checks which choice the friend has chosen 
    this.db.database.ref("userChallengesWithFriend/" + this.challengerName + "/current/" + this.username).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "challengeStatus") {

            // If both user and the friend has chosen that they have completed the task we update
            // both scores and set a streak.  
            if (childData == "completed") {
              getUserAndFriendCurrentScore();
              checkIfUserAndFriendHasAStreak();
              deleteCurrentChallenge();
              resetVariables();
            }

            // If the friend has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
            }

            // If the friend has not completed the challenge, we give points only to the user. 
            else {
              giveTheUserPoints();
              deleteCurrentChallenge();
              resetVariables();
            }
          }
        });
      });
  }

  sendChallengeSkipped() {


    var updateChallengeStatus = () => {
      this.db.object(`userChallengesWithFriend/${this.username}/current/${this.challengerName}`).update({ "challengeStatus": "skip" });
      this.toastr.success('You have chosen that you skipped the challenge.', 'Challenge With a Friend');
    }


    // Function that set the friend current score to a variable and
    // updating both with 200 points.
    var updateFriendCurrentScore = (currentScore) => {
      {
        this.opponentCurrentScore = currentScore
        this.opponentCurrentScore = this.opponentCurrentScore + 200;
        this.db.object(`scores/${this.challengerName}/points`).update({ "score": this.opponentCurrentScore });
        this.toastr.success('Too bad that you passed the challenge. At least your friend gets 200 points for complete the challenge.', 'Challenge With a Friend');
      }

    }

    // Function that get the the friend current score and send 
    // it to updateUserAndFriendCurrentScore. 
    var getTheFriendCurrentScore = () => {

      // For the opponent
      this.db.database.ref("scores/" + this.challengerName + "/points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "score") {
              if (childData == undefined) {
                childData = 0;
              }
              updateFriendCurrentScore(childData);
            }
          });
        });
    }

    var bothSkippedTheChallenge = () => {
      this.toastr.success('Both you and your friend skipped the challenge. Maybe it was the not right challenge for you guys, try another challenge.', 'Challenge With a Friend');
    }

    var resetVariables = () => {
      this.challengeFind = false;
      this.counterChild = 0;
    }

    var deleteCurrentChallenge = () => {
      this.db.object(`userChallengesWithFriend/${this.username}/current/${this.challengerName}`).remove();
      this.db.object(`userChallengesWithFriend/${this.challengerName}/current/${this.username}`).remove();
      this.router.navigateByUrl('/');
    }

    // Checks which choice the friend has chosen 
    this.db.database.ref("userChallengesWithFriend/" + this.challengerName + "/current/" + this.username).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "challengeStatus") {

            // If the friend has completed the task we update
            // the friend score.  
            if (childData == "completed") {
              getTheFriendCurrentScore();
              deleteCurrentChallenge();
              resetVariables();
            }

            // If the friend has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
            }

            // If the friend has not completed the challenge, we give points only to the user. 
            else {
              bothSkippedTheChallenge();
              deleteCurrentChallenge();
              resetVariables();
            }
          }
        });
      });
  }

  acceptChallenge(challengerName, challenge) {
    this.db.object(`userChallengesWithFriend/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallengesWithFriend/${challengerName}/outgoing/${this.username}`).remove();
    this.db.object(`userChallengesWithFriend/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "challengeStatus": "" });
    this.db.object(`userChallengesWithFriend/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "challengeStatus": "" });
  }

  declineChallenge(challengerName) {
    this.db.object(`userChallengesWithFriend/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallengesWithFriend/${challengerName}/outgoing/${this.username}`).remove();
  }

  selectChallenge(challengeName, challengerName) {
    this.challengerName = challengerName;
    this.selectedChallenge = challengeName;
    var setDesc = (decription) => { this.challengeDescription = decription };
    this.db.database.ref("challenges/challengeWithFriend/" + challengeName).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "challengeInfo") {
            setDesc(childData);
          }
        });
      });
  }

  returnToChallengeWithFriendOverview() {
    this.selectedChallenge = "";
  }

  goToChallengeWithFriend() {
    this.router.navigateByUrl('/challengeWithFriend');
  }

  //Updates the user's challenge overview in realtime, could perhaps be more elegant...
  getUserChallenges() {
    var addIncomingToList = (challenge) => { this.ListOfIncomingChallenges.push(challenge) };
    var addOutgoingToList = (challenge) => { this.ListOfOutgoingChallenges.push(challenge) };
    var addCurrentToList = (challenge) => { this.ListOfCurrentChallenges.push(challenge) };

    let query = "userChallengesWithFriend/" + this.username;
    let currentList = "";
    this.db.database.ref(query).on("value", (snapshot) => {
      this.ListOfIncomingChallenges = [];
      this.ListOfOutgoingChallenges = [];
      this.ListOfCurrentChallenges = [];
      snapshot.forEach((snap) => {
        snap.forEach((childSnap) => {
          var key = childSnap.key;
          var childData = childSnap.val();
          var challengeObject = { challenger: key, challenge: childData["challenge"] };
          if (snap.key == "incoming") {
            addIncomingToList(challengeObject);
          } else if (snap.key == "outgoing") {
            addOutgoingToList(challengeObject);
          } else {
            addCurrentToList(challengeObject);
          }
          return false;
        });
        return false;
      });
    });
  }
}
