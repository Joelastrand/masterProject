import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-challengeview',
  templateUrl: './challengeview.component.html',
  styleUrls: ['./challengeview.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class ChallengeviewComponent implements OnInit {

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
  userCurrentVictories: number = 0;
  opponentCurrentVictories: number = 0;
  challengeFind: boolean = false;
  counterChild: number = 1;
  showExplanationDialog: boolean = false;
  finishChallenge: boolean = false;
  choiceWon: boolean = false;
  choiceLost: boolean = false;


  constructor(private toastr: ToastrService, private db: AngularFireDatabase, public auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getUserChallenges();
  }

  toggleExplanationDialog() {
    this.showExplanationDialog == false ? this.showExplanationDialog = true : this.showExplanationDialog = false;
  }

  resetChoice() {
    this.finishChallenge = false;
    this.choiceWon = false;
    this.choiceLost = false;
    this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "" });
    this.toastr.warning('You have reset your previous choice of the challenge!', 'Challenge a Friend');

  }

  getChallengeStatus() {
    var setFinishChallenge = (challengeStatus) => {

      if (challengeStatus == "won") {
        this.choiceWon = true;
        this.finishChallenge = true;
      }
      else if (challengeStatus == "lost") {
        this.choiceLost = true;
        this.finishChallenge = true;
      }
      else {
        this.finishChallenge = false;
      }
    }

    this.db.database.ref("userChallenges/" + this.username + "/current/" + this.challengerName).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "victoryStatus") {
            setFinishChallenge(childData);
          }
        });
      });
  }

  sendGameWon() {
    var resetChallengeStatus = () => {
      this.db.object(`userChallenges/${this.challengerName}/current/${this.username}`).update({ "victoryStatus": "" });
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "" });
      this.toastr.error('Oh no!Both players have chosen that you have won. Discuss the real winner and redo your selection. ', 'Challenge a friend');
    }

    var setFinishChallenge = () => {
      this.finishChallenge = true;
      this.choiceWon = true;
      this.choiceLost = false;
    }

    var updateChallengeStatus = () => {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "won" });
      this.toastr.success('You have chosen to have won!', 'Challenge a friend');
    }

    // If the user does not have this challenge we create the challenge and give the user one points.
    var createChallenge = () => {
      this.db.object(`scores/${this.username}/challengeFriend/`).update({ [this.selectedChallenge]: { "name": this.selectedChallenge, "victories": 1 } });
    }

    var updateUserCurrentChallengeVictories = (victories) => {
      this.userCurrentVictories = victories
      this.userCurrentVictories = this.userCurrentVictories + 1;
      this.db.object(`scores/${this.username}/challengeFriend/${this.selectedChallenge}`).update({ "victories": this.userCurrentVictories });
      this.userCurrentVictories = 0;
    }

    var compareChildToFindVictories = (challenge) => {
      this.db.database.ref("scores/" + this.username + "/challengeFriend/" + challenge).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "victories") {
              if (childData == undefined) {
                childData = 0;
              }
              updateUserCurrentChallengeVictories(childData);
            }
          });
        });
    }

    var compareChildToChallenges = (key, numberOfChild) => {
      // Need to counter the child so we can create a challenge if it is neccessary. 
      // The counterChild starts on 1 because it the field challengeFriend has one child from beginning
      // go file setusername.ts to see which attributes that is given to the user from start. 
      this.counterChild = this.counterChild + 1;

      // if key is the right challenge, we will update the victories at the user. 
      if (key == this.selectedChallenge) {
        compareChildToFindVictories(key);
        // This means that we don't need to create a challenge, it already exist.
        this.challengeFind = true;
      }

      // Creates a challenge if the user does not has this challenge yet. Important that we have loop 
      // through all the children first. 
      else if (this.challengeFind == false && numberOfChild == this.counterChild) {
        createChallenge();
      }
    }


    var getUserCurrentChallengeVictories = () => {

      this.db.database.ref("scores/" + this.username + "/challengeFriend").once("value")
        .then(function (snapshot) {
          let numberOfChild = snapshot.numChildren();

          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            compareChildToChallenges(key, numberOfChild);
          });
        });
    }

    // Function that sets the user and opponent current score to a variable and
    // updating it with 200 resp 150. Both players get points for playing.
    var updateUserAndOpponentCurrentScore = (currentScore, whichUser) => {

      // The user
      if (whichUser == 1) {
        this.userCurrentScore = currentScore
        this.userCurrentScore = this.userCurrentScore + 200;
        this.db.object(`scores/${this.username}/points`).update({ "score": this.userCurrentScore });
        this.toastr.success('Congratulations to the victory! You got 200 points and plus one victory in the challenge ' + this.selectedChallenge, 'Challenge a friend');
      }

      // The opponent
      else if (whichUser == 2) {
        this.opponentCurrentScore = currentScore
        this.opponentCurrentScore = this.opponentCurrentScore + 150;
        this.db.object(`scores/${this.challengerName}/points`).update({ "score": this.opponentCurrentScore });
      }

    }

    // Function that get the user and opponents current score and send 
    //it to updateUserAndOpponentCurrentScore. 
    var getUserAndOpponentCurrentScore = () => {

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
              updateUserAndOpponentCurrentScore(childData, 1);
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
              updateUserAndOpponentCurrentScore(childData, 2);
            }
          });
        });
    }

    var resetVariables = () => {
      this.challengeFind = false;
      this.counterChild = 0;
    }

    var deleteCurrentChallenge = () => {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).remove();
      this.db.object(`userChallenges/${this.challengerName}/current/${this.username}`).remove();
      this.router.navigateByUrl('/');
    }

    // Checks if the user and the opponent has different choise on who is winner. 
    this.db.database.ref("userChallenges/" + this.challengerName + "/current/" + this.username).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "victoryStatus") {

            // If the user has choice that he/she won and the opponent has choice he/she lost we can
            // give points to the winner. 
            if (childData == "lost") {
              getUserAndOpponentCurrentScore();
              getUserCurrentChallengeVictories();
              deleteCurrentChallenge();
              setFinishChallenge();
              resetVariables();
            }

            // If the opponent has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
              setFinishChallenge();
            }

            // If both players hacve choose the same choice, we reset both options. 
            else {
              resetChallengeStatus();
            }
          }
        });
      });
  }

  SendGameLost() {

    var setFinishChallenge = () => {
      this.finishChallenge = true;
      this.choiceLost = true;
      this.choiceWon = false;
    }


    var resetChallengeStatus = () => {
      this.db.object(`userChallenges/${this.challengerName}/current/${this.username}`).update({ "victoryStatus": "" });
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "" });
      this.toastr.error('Oh no!Both players have chosen that you have lost. Even if you are friends, someone need to win, please redo your selection. ', 'Challenge a friend');
    }

    var updateChallengeStatus = () => {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "lost" });
      this.toastr.success('You have chosen to have lost', 'Challenge a friend');
    }

    // If the opponent does not have this challenge we create the challenge and give the opponent one point.
    var createChallenge = () => {
      this.db.object(`scores/${this.challengerName}/challengeFriend/`).update({ [this.selectedChallenge]: { "name": this.selectedChallenge, "victories": 1 } });
    }

    var updateOpponetCurrentChallengeVictories = (victories) => {
      this.opponentCurrentVictories = victories
      this.opponentCurrentVictories = this.opponentCurrentVictories + 1;
      this.db.object(`scores/${this.challengerName}/challengeFriend/${this.selectedChallenge}`).update({ "victories": this.opponentCurrentVictories });
      this.userCurrentVictories = 0;
    }

    var compareChildToFindVictories = (challenge) => {
      this.db.database.ref("scores/" + this.challengerName + "/challengeFriend/" + challenge).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "victories") {
              if (childData == undefined) {
                childData = 0;
              }
              updateOpponetCurrentChallengeVictories(childData);
            }
          });
        });
    }

    var compareChildToChallenges = (key, numberOfChild) => {
      // Need to counter the child so we can create a challenge if it is neccessary. 
      // The counterChild starts on 1 because it the field challengeFriend has one child from beginning
      // go file setusername.ts to see which attributes that is given to the user from start. 
      this.counterChild = this.counterChild + 1;

      // if key is the right challenge, we will update the victories at the opponent. 
      if (key == this.selectedChallenge) {
        compareChildToFindVictories(key);
        // This means that we don't need to create a challenge, it already exist.
        this.challengeFind = true;
      }

      // Creates a challenge if the opponent does not has this challenge yet. Important that we have loop 
      // through all the children first. 
      else if (this.challengeFind == false && numberOfChild == this.counterChild) {
        createChallenge();
      }
    }


    var getOpponentCurrentChallengeVictories = () => {

      this.db.database.ref("scores/" + this.challengerName + "/challengeFriend").once("value")
        .then(function (snapshot) {
          let numberOfChild = snapshot.numChildren();

          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            compareChildToChallenges(key, numberOfChild);
          });
        });
    }

    // Function that sets the opponent and user current score to a variable and
    // updating it with 150 resp 200. Both players get points for playing.
    var updateOpponentAndUserCurrentScore = (currentScore, whichUser) => {

      // The opponent
      if (whichUser == 1) {
        this.opponentCurrentScore = currentScore
        this.opponentCurrentScore = this.opponentCurrentScore + 200;
        this.db.object(`scores/${this.challengerName}/points`).update({ "score": this.opponentCurrentScore });
      }

      // The user
      else if (whichUser == 2) {
        this.userCurrentScore = currentScore
        this.userCurrentScore = this.userCurrentScore + 150;
        this.db.object(`scores/${this.username}/points`).update({ "score": this.userCurrentScore });
      }
      this.toastr.success('You have unfortunately lost but gain 150 points for playing', 'Challenge a friend');
    }

    // Function that get the opponent current score and send it to updateOpponentCurrentScore. 
    var getOpponentAndUserCurrentScore = () => {

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
              updateOpponentAndUserCurrentScore(childData, 1);
            }
          });
        });

      // For the user
      this.db.database.ref("scores/" + this.challengerName + "/points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "score") {
              if (childData == undefined) {
                childData = 0;
              }
              updateOpponentAndUserCurrentScore(childData, 2);
            }
          });
        });
    }

    var deleteCurrentChallenge = () => {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).remove();
      this.db.object(`userChallenges/${this.challengerName}/current/${this.username}`).remove();
      this.router.navigateByUrl('/');

    }

    var resetVariables = () => {
      this.challengeFind = false;
      this.counterChild = 0;
    }

    this.db.database.ref("userChallenges/" + this.challengerName + "/current/" + this.username).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "victoryStatus") {

            // If the user has choice that he/she won and the opponent has choice he/she lost we can
            // give points to the winner. 
            if (childData == "won") {
              getOpponentAndUserCurrentScore();
              getOpponentCurrentChallengeVictories();
              resetVariables();
              setFinishChallenge();
              deleteCurrentChallenge();
            }

            // If the opponent has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
              setFinishChallenge();
            }

            // If both players hacve choose the same choice, we reset both options. 
            else {
              resetChallengeStatus();
            }
          }
        });
      });

  }

  acceptChallenge(challengerName, challenge) {
    this.db.object(`userChallenges/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallenges/${challengerName}/outgoing/${this.username}`).remove();
    this.db.object(`userChallenges/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "victoryStatus": "" });
    this.db.object(`userChallenges/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "victoryStatus": "" });
  }

  declineChallenge(challengerName) {
    this.db.object(`userChallenges/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallenges/${challengerName}/outgoing/${this.username}`).remove();
  }

  selectChallenge(challengeName, challengerName) {
    this.challengerName = challengerName;
    this.selectedChallenge = challengeName;

    this.getChallengeStatus(); 

    var setDesc = (decription) => { this.challengeDescription = decription };
    this.db.database.ref("challenges/challengeFriend/" + challengeName).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "challengeInfo") {
            setDesc(childData);
          }
        });
      });

    //this.challengeDescription =  this.db.object(`challenges/challengeFriend/${challengeName}/description`);
    //this.challengeDescription = this.challengeObject.description; 
    //this.challengeObject.subscribe(users => this.users = users);

    //console.log(this.challengeObject);
  }

  returnToChallengeOverview() {
    this.selectedChallenge = "";
  }

  goToChallengeFriend() {
    this.router.navigateByUrl('/challengefriend');
  }

  //Updates the user's challenge overview in realtime, could perhaps be more elegant...
  getUserChallenges() {
    var addIncomingToList = (challenge) => { this.ListOfIncomingChallenges.push(challenge) };
    var addOutgoingToList = (challenge) => { this.ListOfOutgoingChallenges.push(challenge) };
    var addCurrentToList = (challenge) => { this.ListOfCurrentChallenges.push(challenge) };

    let query = "userChallenges/" + this.username;
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
  /* getIncomingChallenges() {
     var addIncomingToList = (challenge) => {  this.ListOfIncomingChallenges.push(challenge) };
     let query = "userChallenges/" + this.username + "/incoming"
     this.db.database.ref(query).on("value", (snapshot) => {
       this.ListOfIncomingChallenges = [];
       snapshot.forEach((snap) => {
         var key = snap.key;
         var childData = snap.val();
         var challengeObject = { challenger: key, challenge: childData["challenge"] };
         addIncomingToList(challengeObject);
         return false;
       });
     });
   }*/


}
