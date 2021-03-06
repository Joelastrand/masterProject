import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AchievementCheckerService } from "../../achievement-checker.service";

@Component({
  selector: 'app-challengeViewWithFriend',
  templateUrl: './challengeViewWithFriend.component.html',
  styleUrls: ['./challengeViewWithFriend.component.scss'],
  providers: [AchievementCheckerService, AngularFireDatabase]

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
  opponentTotalScore: number = 0;
  userTotalScore: number = 0;


  userAndFriendCurrentStreak: number = 0;
  opponentCurrentVictories: number = 0;
  challengeFind: boolean = false;
  counterChild: number = 1;
  showExplanationDialog: boolean = false;
  finishChallenge: boolean = false;
  choiceCompleted: boolean = false;
  choiceSkipped: boolean = false;
  RulesAndDescriptionDialog: boolean = false;


  // Showing the date,time,location 
  challengeDate: string = "";
  challengeTime: string = "";
  challengeLocation: string = "";
  ChallengeInformationDialog: boolean = false;
  typeWonLost: boolean = false;


  constructor(private toastr: ToastrService, private db: AngularFireDatabase, public achievementChecker: AchievementCheckerService, private router: Router) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.username = localStorage.getItem("localuserName");
    this.getUserChallenges();
  }

  /**************** Toggles functions ********************/

  toggleExplanationDialog() {
    this.showExplanationDialog == false ? this.showExplanationDialog = true : this.showExplanationDialog = false;
  }

  toggleRulesAndDescriptionDialog() {
    this.RulesAndDescriptionDialog == false ? this.RulesAndDescriptionDialog = true : this.RulesAndDescriptionDialog = false;
  }

  toggleChallengeInformationDialog() {
    this.ChallengeInformationDialog == false ? this.ChallengeInformationDialog = true : this.ChallengeInformationDialog = false;
  }


  /**************** Change challenge information about time/date/location ********************/

  // Deletes challenges from current when both players has finished the challenge.
  deleteCurrentChallenge(username, challengerName) {
    this.db.object(`userChallengesWithFriend/${username}/current/${challengerName}`).remove();
    this.db.object(`userChallengesWithFriend/${challengerName}/current/${username}`).remove();
    this.router.navigateByUrl('/');
  }

  sendChallenge() {
    this.db.object(`userChallengesWithFriend/${this.username}/outgoing/${this.challengerName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
    this.db.object(`userChallengesWithFriend/${this.username}/outgoing/${this.challengerName}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //update outgoing for sender
    this.db.object(`userChallengesWithFriend/${this.challengerName}/incoming/${this.username}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
    this.db.object(`userChallengesWithFriend/${this.challengerName}/incoming/${this.username}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //Update incoming for receiver

    this.deleteCurrentChallenge(this.username, this.challengerName);
    this.toastr.success('You have reschedule the challenge ', 'Challenge with a friend');

  }

  changeChallengeInformation() {
    var dateFormat = /[\d/]/;
    var timeFormat = /[\d:]/;
    if (!(dateFormat.test(this.challengeDate)) || (!(timeFormat.test(this.challengeTime))) || (!this.challengeTime) || (!this.challengeLocation)) {
      this.toastr.error('Wrong input', 'Submit');
    }
    /*
    if (!(timeFormat.test(this.challengeTime))) 
    {
      this.toastr.error('Wrong input at time, please enter only numbers and : ', 'Submit');
    }
    */
    else {
      this.toggleChallengeInformationDialog();
      this.sendChallenge();
    }
  }

  /**************** Get challenge information about time/date/location ********************/
  getChallengesInformation() {

    var getTime = (time) => {
      this.challengeTime = time;
    }

    var getDate = (date) => {
      this.challengeDate = date;
    }

    var getLocation = (location) => {
      this.challengeLocation = location;
    }

    this.db.database.ref("userChallengesWithFriend/" + this.username + "/current/" + this.challengerName + "/challengeInformation").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "time") {
            getTime(childData);
          }
          else if (key == "date") {
            getDate(childData);
          }
          else if (key == "location") {
            getLocation(childData);
          }
        });
      });
  }

  /**************** START Undo button ********************/
  resetChoice() {
    this.finishChallenge = false;
    this.choiceSkipped = false;
    this.choiceCompleted = false;
    this.db.object(`userChallengesWithFriend/${this.username}/current/${this.challengerName}`).update({ "challengeStatus": "" });
    this.toastr.warning('You have reset your previous choice of the challenge', 'Challenge With a Friend');

  }

  getChallengeStatus() {
    var setFinishChallenge = (challengeStatus) => {

      if (challengeStatus == "completed") {
        this.choiceCompleted = true;
        this.finishChallenge = true;
      }
      else if (challengeStatus == "skip") {
        this.choiceSkipped = true;
        this.finishChallenge = true;
      }
      else {
        this.finishChallenge = false;
      }
    }

    this.db.database.ref("userChallengesWithFriend/" + this.username + "/current/" + this.challengerName).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "challengeStatus") {
            setFinishChallenge(childData);
          }
        });
      });
  }
  /******************************** ********************/


  /****************General functions ***************** */
  setFinishChallenge() {
    this.finishChallenge = true;
    this.choiceCompleted = true;
    this.choiceSkipped = false;
  }


  resetVariables() {
    this.challengeFind = false;
    this.counterChild = 0;
    this.finishChallenge = false;
  }

  setchallengeType() {
    var setType = (challengeType) => {
      if (challengeType == "won/lost") {
        this.typeWonLost = true;
      }
    };

    this.db.database.ref("challenges/challengeWithFriend/" + this.selectedChallenge).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "type") {
            setType(childData);
          }
        });
      });
  }

  /**************************************************** */

  sendChallengeCompleted() {
    var giveTheUserPoints = () => {
      // Give the optional parameter a value so we can update only the user.
      getUserAndFriendScores(1);
    }

    var updateChallengeStatus = () => {
      this.db.object(`userChallengesWithFriend/${this.username}/current/${this.challengerName}`).update({ "challengeStatus": "completed" });
      this.toastr.success('You have chosen that you have complete the challenge', 'Challenge With a Friend');
    }

    // If the user does not have this challenge we create the challenge and give the user one points.
    var createFriendStreak = () => {
      var d = new Date();

      var date = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

      this.db.object(`scores/${this.username}/challengeWithFriend/`).update({ [this.challengerName]: { "name": this.challengerName, "streak": 1, "date": date } });
      this.db.object(`scores/${this.challengerName}/challengeWithFriend/`).update({ [this.username]: { "name": this.username, "streak": 1, "date": date } });
    }

    var updateUserAndFriendCurrentStreak = (streak) => {


      // Create yesterdays variable so we can compare it with the timestampe date. 
      var yesterdaysDate = new Date();
      yesterdaysDate.setDate(yesterdaysDate.getDate() - 1);
      var yesterdayDate = "" + yesterdaysDate.getFullYear() + "-" + (yesterdaysDate.getMonth() + 1) + "-" + (yesterdaysDate.getDate());

      var fridayDate = new Date();
      fridayDate.setDate(fridayDate.getDate() - 3);
      var friday = "" + fridayDate.getFullYear() + "-" + (fridayDate.getMonth() + 1) + "-" + (fridayDate.getDate());

      var d = new Date();
      var weekday = d.getDay();
      var todaysDate = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

      var checkIfStreakIsValid = (latestChallengeDate) => {

        // The streak is valid and it contiune to grow
        if (latestChallengeDate == yesterdayDate) {
          this.userAndFriendCurrentStreak = streak + 1;

          this.db.object(`scores/${this.username}/challengeWithFriend/${this.challengerName}`).update({ "streak": this.userAndFriendCurrentStreak, "date": todaysDate });
          this.db.object(`scores/${this.challengerName}/challengeWithFriend/${this.username}`).update({ "streak": this.userAndFriendCurrentStreak, "date": todaysDate });

        }

        // If the players challenge each other more then once per day 
        else if (latestChallengeDate == todaysDate) {
          // Nothing happen to the streak, it remains but don't grows. 
        }

        else if (weekday == 1 && latestChallengeDate == friday) {
          this.userAndFriendCurrentStreak = streak + 1;

          this.db.object(`scores/${this.username}/challengeWithFriend/${this.challengerName}`).update({ "streak": this.userAndFriendCurrentStreak, "date": todaysDate });
          this.db.object(`scores/${this.challengerName}/challengeWithFriend/${this.username}`).update({ "streak": this.userAndFriendCurrentStreak, "date": todaysDate });
        }


        // The streak has terminated and a new streaks begin
        else {
          if (weekday == 0 || weekday == 6) {
            //The streaks remains because the day is Sunday or Saturday. 
          }
          else {
            createFriendStreak();
          }
        }
      }

      this.db.database.ref("scores/" + this.username + "/challengeWithFriend/" + this.challengerName).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "date") {
              checkIfStreakIsValid(childData);
            }

          });
        });

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


    // Function that sets the user and the friend current total score and weekly score and
    // updating both with 400,300 or 200 points.
    var updateUserAndFriendCurrentScore = (totalScore, currentScore, whichUser, challengePoints, OnlyUserCompleted = 0) => {
      // The user
      if (whichUser == 1 && OnlyUserCompleted == 0) {
        this.userCurrentScore = currentScore
        this.userTotalScore = totalScore + challengePoints;
        this.userCurrentScore = this.userCurrentScore + challengePoints;

        this.db.object(`scores/${this.username}/points`).update({ "score": this.userCurrentScore });
        this.db.object(`scores/${this.username}/points`).update({ "totalScore": this.userTotalScore });

        this.toastr.success('Excellent work! You and ' + this.challengerName + ' have completed the challenge. Both of you get ' + challengePoints + ' points.', 'Challenge With a Friend');
        this.achievementChecker.checkPointStatus(this.username, this.userTotalScore, this.userCurrentScore);
      }

      // If only the user completes the challenge
      if (whichUser == 1 && OnlyUserCompleted == 1) {

        this.userCurrentScore = currentScore
        this.userTotalScore = totalScore + 200;
        this.userCurrentScore = this.userCurrentScore + 200;

        this.db.object(`scores/${this.username}/points`).update({ "score": this.userCurrentScore });
        this.db.object(`scores/${this.username}/points`).update({ "totalScore": this.userTotalScore });

        this.toastr.success('Awesome work in completing the challenge! However, your friend failed to complete it. But no worries, you get 200 points for the challenge anyway.', 'Challenge With a Friend');
        this.achievementChecker.checkPointStatus(this.username, this.userTotalScore, this.userCurrentScore);
      }

      // The opponent
      else if (whichUser == 2 && OnlyUserCompleted == 0) {

        this.opponentCurrentScore = currentScore
        this.opponentTotalScore = totalScore + challengePoints;
        this.opponentCurrentScore = this.opponentCurrentScore + challengePoints;
        this.db.object(`scores/${this.challengerName}/points`).update({ "score": this.opponentCurrentScore });
        this.db.object(`scores/${this.challengerName}/points`).update({ "totalScore": this.opponentTotalScore });

        this.achievementChecker.checkPointStatus(this.challengerName, this.opponentTotalScore, this.opponentCurrentScore);
      }
    }

    var getChallengeLevelBeforeUpdate = (totalScore, currentScore, whichUser, OnlyUserCompleted) => {

      var challengePoints = 0;
      this.db.database.ref("challenges/challengeWithFriend/" + this.selectedChallenge).once("value")
        .then(function (snapshot) {
          challengePoints = 0;

          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            if (key == "level") {
              if (childData == "hard") {
                challengePoints = 400;
              }
              else if (childData == "medium") {
                challengePoints = 300;
              }
              else {
                challengePoints = 200;
              }
              updateUserAndFriendCurrentScore(totalScore, currentScore, whichUser, challengePoints, OnlyUserCompleted);
            }
          });
        });
    }

    // Function that get the user and the friend current total score and send 
    //it to getUserAndFriendCurrentWeeklyScore. 
    var getUserAndFriendScores = (OnlyUserCompleted = 0) => {

      var totalScore, currentScore = 0;
      // For the user
      this.db.database.ref("scores/" + this.username + "/points").once("value")
        .then(function (snapshot) {
          totalScore = currentScore = 0;
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "score") {
              if (childData == undefined) {
                currentScore = 0;
              } else {
                currentScore = childData;
              }
            } else if (key == "totalScore") {
              if (childData == undefined) {
                totalScore = 0;
              } else {
                totalScore = childData;
              }
            }
          });
          //User is number 1
          getChallengeLevelBeforeUpdate(totalScore, currentScore, 1, OnlyUserCompleted);
        });
      // For the opponent
      this.db.database.ref("scores/" + this.challengerName + "/points").once("value")
        .then(function (snapshot) {
          totalScore = currentScore = 0;
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "score") {
              if (childData == undefined) {
                currentScore = 0;
              } else {
                currentScore = childData;
              }
            } else if (key == "totalScore") {
              if (childData == undefined) {
                totalScore = 0;
              } else {
                totalScore = childData;
              }
            }
          });
          //Opponent is number 2
          getChallengeLevelBeforeUpdate(totalScore, currentScore, 2, OnlyUserCompleted);
        });
    }

    var resetVariables = () => {
      this.resetVariables();
    }

    var setFinishChallenge = () => {
      this.setFinishChallenge();
    }

    var deleteCurrentChallenge = () => {
      this.deleteCurrentChallenge(this.username, this.challengerName);
    }

    var sendCompletedMessageToFriend = () => {
      this.db.object(`inbox/${this.challengerName}/challengeWith${this.username}`).update({ "info": "Succes", "message": "Nice work! You and your friend have both completed the " + this.selectedChallenge + " challenge."});
    }

    var sendSkippedMessageToFriend = () => {
        this.db.object(`inbox/${this.challengerName}/challengeWith${this.username}`).update({ "info": "Challenge with a friend", "message": "Sadly, you skipped the " + this.selectedChallenge + " challenge. But your friend has completed it." });
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
              sendCompletedMessageToFriend();
              getUserAndFriendScores();
              checkIfUserAndFriendHasAStreak();
              deleteCurrentChallenge();
              resetVariables();
              setFinishChallenge();
            }

            // If the friend has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
              setFinishChallenge();

            }

            // If the friend has not completed the challenge, we give points only to the user. 
            else {
              sendSkippedMessageToFriend(); 
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

    var updateFriendTotalScoreAndCurrentScore = (opponentCurrentScore, opponentTotalScore) => {

      this.userCurrentScore = opponentCurrentScore
      this.opponentTotalScore = opponentTotalScore + 200;
      this.userCurrentScore = this.userCurrentScore + 200;

      this.db.object(`scores/${this.challengerName}/points`).update({ "score": this.userCurrentScore });
      this.db.object(`scores/${this.challengerName}/points`).update({ "totalScore": this.opponentTotalScore });

      this.toastr.success('Too bad that you skipped the challenge. At least your friend gets 200 points for completing the challenge.', 'Challenge With a Friend');

      this.achievementChecker.checkPointStatus(this.challengerName, this.opponentTotalScore, this.opponentCurrentScore);
    }
    // Function that get the the friend current total score and send 
    // it to updateUserAndFriendCurrentScore. 
    var getTheFriendCurrentScores = () => {

      var totalScore, currentScore = 0;

      // For the opponent
      this.db.database.ref("scores/" + this.challengerName + "/points").once("value")
        .then(function (snapshot) {
          totalScore = currentScore = 0;
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "score") {
              if (childData == undefined) {
                currentScore = 0;
              } else {
                currentScore = childData;
              }
            } else if (key == "totalScore") {
              if (childData == undefined) {
                totalScore = 0;
              } else {
                totalScore = childData;
              }
            }
          });
          updateFriendTotalScoreAndCurrentScore(currentScore, totalScore);
        });

    }

    var bothSkippedTheChallenge = () => {
      this.toastr.success('Both you and your friend skipped the challenge. Maybe it was the not right challenge for you guys, try another challenge.', 'Challenge With a Friend');
      this.db.object(`inbox/${this.challengerName}/challengeWith${this.username}`).update({ "info": "Challenge with a friend", "message": "Both you and your friend skipped the " + this.selectedChallenge + " challenge. Maybe it was the not right challenge for you guys, try another challenge." });

    }

    var resetVariables = () => {
      this.resetVariables();
    }

    var setFinishChallenge = () => {
      this.setFinishChallenge();
    }


    var deleteCurrentChallenge = () => {
      this.deleteCurrentChallenge(this.username, this.challengerName);
    }

    var sendMessageToFriend = () => {
      this.db.object(`inbox/${this.challengerName}/challengeWith${this.username}`).update({ "info": "Challenge with a friend", "message": "Nice work in completing the " + this.selectedChallenge + " challenge. Sadly, your friend skipped the challenge." });
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
              sendMessageToFriend();
              getTheFriendCurrentScores();
              deleteCurrentChallenge();
              resetVariables();
              setFinishChallenge();
            }

            // If the friend has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
              setFinishChallenge();
            }

            // If both skipps the challenge. 
            else {
              bothSkippedTheChallenge();
              deleteCurrentChallenge();
              resetVariables();
            }
          }
        });
      });
  }

  acceptChallenge(challengerName, challenge, time, date, location) {
    var setChallengeType = (challengeType) => {

      if (challengeType == "won/lost") {
        this.db.object(`userChallengesWithFriend/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "challengeStatus": "" });
        this.db.object(`userChallengesWithFriend/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "challengeStatus": "" });

        this.db.object(`userChallengesWithFriend/${challengerName}/current/${this.username}`).update({ "challengeInformation": { "time": time, "date": date, "location": location } });
        this.db.object(`userChallengesWithFriend/${this.username}/current/${challengerName}`).update({ "challengeInformation": { "time": time, "date": date, "location": location } });
      }
      else if (challengeType == "amount") {
        this.db.object(`userChallengesWithFriend/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
        this.db.object(`userChallengesWithFriend/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
      }
      else if (challengeType == "time") {
        this.db.object(`userChallengesWithFriend/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
        this.db.object(`userChallengesWithFriend/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
      }
    }

    this.db.database.ref("challenges/challengeWithFriend/" + challenge).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "type") {
            setChallengeType(childData);
          }
        });
      });
    this.db.object(`userChallengesWithFriend/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallengesWithFriend/${challengerName}/outgoing/${this.username}`).remove();

  }

  declineChallenge(challengerName) {
    this.db.object(`userChallengesWithFriend/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallengesWithFriend/${challengerName}/outgoing/${this.username}`).remove();
  }

  selectChallenge(challengeName, challengerName) {
    this.challengerName = challengerName;
    this.selectedChallenge = challengeName;

    // Funtctions that needs to change the html page layout. 
    this.getChallengeStatus();
    this.setchallengeType();
    this.getChallengesInformation();


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
          var challengeObject = { challenger: key, challenge: childData["challenge"], date: childData["date"], time: childData["time"], location: childData["location"] };
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
