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

  constructor(private toastr: ToastrService, private db: AngularFireDatabase, public auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getUserChallenges();
  }


  sendGameWon() {
    var resetChallengeStatus = () => {
      this.db.object(`userChallenges/${this.challengerName}/current/${this.username}`).update({ "victoryStatus": "" });
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "" });
      this.toastr.error('Oh no!Both players have chosen that you have won. Discuss the real winner and redo your selection. ', 'Challenge a friend');
    }


    var updateChallengeStatus = () => {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "won" });
      this.toastr.success('You have chosen to have won!', 'Challenge a friend');
    }

    var updateUserCurrentChallengePoints = (currentPoints) => {
      console.log("Update current wins on challenge");
    }
    var getUserUserCurrentChallengePoints = () => {
      console.log("Get the current wins on challenge");
    }

    // Function that sets the user and opponent current score to a variable and
    // updating it with 200 resp 150. Both players get points for playing.
    var updateUserAndOpponentCurrentScore = (currentScore, whichUser) => {

      // The user
      if (whichUser == 1) {
        this.userCurrentScore = currentScore
        this.userCurrentScore = this.userCurrentScore + 200;
        this.db.object(`scores/${this.username}/Points`).update({ "points": this.userCurrentScore });
        this.toastr.success('Congratulations to the victory! You have got 200 points.', 'Challenge a friend');
      }

      // The opponent
      else if (whichUser == 2) {
        this.opponentCurrentScore = currentScore
        this.opponentCurrentScore = this.opponentCurrentScore + 150;
        this.db.object(`scores/${this.challengerName}/Points`).update({ "points": this.opponentCurrentScore });
      }

    }

    // Function that get the user and opponents current score and send 
    //it to updateUserAndOpponentCurrentScore. 
    var getUserAndOpponentCurrentScore = () => {

      // For the user
      this.db.database.ref("scores/" + this.username + "/Points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "points") {
              if (childData == undefined) {
                childData = 0;
              }
              updateUserAndOpponentCurrentScore(childData, 1);
            }
          });
        });
      // For the opponent
      this.db.database.ref("scores/" + this.challengerName + "/Points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "points") {
              if (childData == undefined) {
                childData = 0;
              }
              updateUserAndOpponentCurrentScore(childData, 2);
            }
          });
        });
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
              deleteCurrentChallenge();
            }

            // If the opponent has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
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

    var resetChallengeStatus = () => {
      this.db.object(`userChallenges/${this.challengerName}/current/${this.username}`).update({ "victoryStatus": "" });
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "" });
      this.toastr.error('Oh no!Both players have chosen that you have lost. Even if you are friends, someone need to win, please redo your selection. ', 'Challenge a friend');
    }

    var updateChallengeStatus = () => {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "lost" });
      this.toastr.success('You have chosen to have lost', 'Challenge a friend');
    }

    // Function that sets the user and opponent current score to a variable and
    // updating it with 150 resp 200. Both players get points for playing.
    var updateOpponentAndUserCurrentScore = (currentScore, whichUser) => {

      // The opponent
      if (whichUser == 1) {
        this.opponentCurrentScore = currentScore
        this.opponentCurrentScore = this.opponentCurrentScore + 200;
        this.db.object(`scores/${this.challengerName}/Points`).update({ "points": this.opponentCurrentScore });
      }

      // The user
      else if (whichUser == 2) {
        this.userCurrentScore = currentScore
        this.userCurrentScore = this.userCurrentScore + 150;
        this.db.object(`scores/${this.username}/Points`).update({ "points": this.userCurrentScore });
      }
      this.toastr.success('You have unfortunately lost but gain 150 points for playing', 'Challenge a friend');
    }

    // Function that get the opponent current score and send it to updateOpponentCurrentScore. 
    var getOpponentAndUserCurrentScore = () => {

      // For the opponent
      this.db.database.ref("scores/" + this.challengerName + "/Points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "points") {
              if (childData == undefined) {
                childData = 0;
              }
              updateOpponentAndUserCurrentScore(childData, 1);
            }
          });
        });

      // For the user
      this.db.database.ref("scores/" + this.challengerName + "/Points").once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "points") {
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
              deleteCurrentChallenge();
            }

            // If the opponent has not respond yet we set the users choice.
            else if (childData == "") {
              updateChallengeStatus();
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
