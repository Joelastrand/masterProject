import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AchievementCheckerService } from "../../achievement-checker.service";

@Component({
  selector: 'app-challengeview',
  templateUrl: './challengeview.component.html',
  styleUrls: ['./challengeview.component.scss'],
  providers: [AchievementCheckerService, AngularFireDatabase]
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

  playerCurrentVictories: number = 0;

  opponentCurrentVictories: number = 0;
  challengeFind: boolean = false;
  counterChild: number = 1;
  showExplanationDialog: boolean = false;
  RulesAndDescriptionDialog: boolean = false;
  finishChallenge: boolean = false;
  choiceWon: boolean = false;
  choiceLost: boolean = false;

  // Showing the date,time,location 
  challengeDate: string = "";
  challengeTime: string = "";
  challengeLocation: string = "";
  ChallengeInformationDialog: boolean = false;


  // Decide which type the challenge is 
  typeWonLost: boolean = false;
  typeTime: boolean = false;
  typeAmount: boolean = false;
  shortName: string = "";
  userAmount: number;
  opponentAmount: number;
  challengeType: string;
  constructor(private toastr: ToastrService, private db: AngularFireDatabase, private achievementChecker: AchievementCheckerService, private router: Router) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.username = localStorage.getItem("localuserName");
    this.getUserChallenges();
    //this.getChallengesInformation();

  }
  /**************** Toggles funct ********************/

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
  sendChallenge() {
    this.db.object(`userChallenges/${this.username}/outgoing/${this.challengerName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
    this.db.object(`userChallenges/${this.username}/outgoing/${this.challengerName}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //update outgoing for sender
    this.db.object(`userChallenges/${this.challengerName}/incoming/${this.username}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
    this.db.object(`userChallenges/${this.challengerName}/incoming/${this.username}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //Update incoming for receiver
    this.deleteCurrentChallenge(this.username, this.challengerName);
    this.toastr.success('You have reschedule the challenge ', 'Challenge a friend');

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

    this.db.database.ref("userChallenges/" + this.username + "/current/" + this.challengerName + "/challengeInformation").once("value")
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

  /**************** Undo button ********************/
  resetChoice() {
    // If the challenge is a type where the user chose between won or lost.
    var resetvictoryStatus = () => {
      this.choiceWon = false;
      this.choiceLost = false;
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "" });
    }

    // If the challenge is a type where the user write in number.
    var resetAmount = () => {
      this.userAmount = 0;
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "amount": "" });
    }

    this.finishChallenge = false;
    this.db.database.ref("userChallenges/" + this.username + "/current/" + this.challengerName).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "victoryStatus") {
            resetvictoryStatus();
          }
          else if (key == "amount") {
            resetAmount();
          }
        });
      });
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

  /**************** END Undo button ********************/

  /********* Functions to make different layout on the html page depeding which challenge is selected */
  setChallengeType() {
    var setuserAmount = (userAmount) => {
      this.userAmount = userAmount;
    }

    var getUserAmount = () => {
      this.db.database.ref("userChallenges/" + this.username + "/current/" + this.challengerName).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            if (key == "amount") {
              setuserAmount(childData);
            }
          });
        });
    }

    var setFinishChallenge = (challengStatus) => {
      if (challengStatus == "") {
        this.finishChallenge = false;
      }
      else {
        this.finishChallenge = true;
        getUserAmount();
      }
    }

    var checkIfChallengeIsDone = (challengeType) => {

      this.db.database.ref("userChallenges/" + this.username + "/current/" + this.challengerName).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            if (key == challengeType) {
              setFinishChallenge(childData);
            }
          });
        });
    }

    var setShortName = (shortName) => {
      this.shortName = shortName;
    }

    var setType = (challengeType) => {

      if (challengeType == "won/lost") {
        this.typeWonLost = true;
        this.typeAmount = false;
        this.typeTime = false;
      }
      else if (challengeType == "amount") {
        this.typeAmount = true;
        this.typeWonLost = false;
        this.typeTime = false;
        checkIfChallengeIsDone(challengeType);
      }
      else if (challengeType == "time") {
        this.typeTime = true;
        this.typeWonLost = false;
        this.typeAmount = false;
        checkIfChallengeIsDone("amount");

      }

    };

    this.db.database.ref("challenges/challengeFriend/" + this.selectedChallenge).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "type") {
            setType(childData);
          }
          else if (key == "shortName") {
            setShortName(childData);
          }
        });
      });
  }


  /********* General functions to streaks, achivevements and points ***************/

  // If the player does not have the challenge it creates it and begin a victory collection.
  createChallenge(playerName, selectedChallenge) {
    this.db.object(`scores/${playerName}/challengeFriend/`).update({ [selectedChallenge]: { "name": selectedChallenge, "victories": 1 } });
    this.checkVictoriesAchievements(selectedChallenge, playerName, 1);
  }

  // Updates the function and which player who won the challenge
  updateChallengeStatus(username, challengerName, winner, challengeType) {

    // User is player 1. 
    if (winner == 1 && challengeType == "won/lost") {
      this.db.object(`userChallenges/${username}/current/${challengerName}`).update({ "victoryStatus": "won" });
      this.toastr.success('You have chosen to have won!', 'Challenge a friend');
    }

    // opponent is player 2. 
    else if (winner == 2 && challengeType == "won/lost") {
      this.db.object(`userChallenges/${username}/current/${challengerName}`).update({ "victoryStatus": "lost" });
      this.toastr.success('You have chosen to have lost', 'Challenge a friend');
    }
    else if (challengeType == "amount") {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "amount": this.userAmount });
      this.toastr.success('You have sent that you did ' + this.userAmount + ' ' +
        this.shortName, 'Challenge a Friend');
    }
    else if (challengeType == "time") {
      this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "amount": this.userAmount });
      this.toastr.success('You have sent that you did ' + this.shortName + ' in ' +
        this.userAmount + ' seconds', 'Challenge a Friend');
    }

  }

  // Deletes challenges from current when both players has finished the challenge.
  deleteCurrentChallenge(username, challengerName) {
    this.db.object(`userChallenges/${username}/current/${challengerName}`).remove();
    this.db.object(`userChallenges/${challengerName}/current/${username}`).remove();
    this.router.navigateByUrl('/');
  }

  // Function that need for the html page, this is required to have a undo button.
  setFinishChallenge(result) {
    if (result == "won") {
      this.finishChallenge = true;
      this.choiceWon = true;
      this.choiceLost = false;
    }
    else if (result == "lost") {
      this.finishChallenge = true;
      this.choiceWon = false;
      this.choiceLost = true;
    }
    else if (result == "amountChallenge") {

    }
  }

  // If both player has chosen same option both need to reselect theirs choice. 
  resetChallengeStatus(username, challengerName) {
    this.db.object(`userChallenges/${this.challengerName}/current/${this.username}`).update({ "victoryStatus": "" });
    this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "victoryStatus": "" });
    this.toastr.error('Oh no!Both players have chosen the same option. Discuss who is the real winner and redo your selection. ', 'Challenge a friend');
    this.db.object(`inbox/${this.challengerName}/resetChallenge${this.username}`).update({ "info": "Who is the winner?", "message": "Oh no!Both you and " + this.username +" have chosen the same option. Discuss who is the real winner in the challenge "+ this.selectedChallenge +" and redo your selection."});
  }

  // Reset variables, it is required to the html to get a undo button.
  resetVariables() {
    this.challengeFind = false;
    this.counterChild = 0;
    this.challengeType = "";
    this.opponentAmount = 0;
    this.userAmount = 0;
  }

  checkVictoriesAchievements(selectedChallenge, playerName, victories) {
    if (selectedChallenge == "Foosball") {
      this.achievementChecker.checkFoosballStatus(playerName, victories);
    }
  }

  checkPointsAchievements(username, totPoints, currPoints) {
    this.achievementChecker.checkPointStatus(username, totPoints, currPoints);
  }

  // Updates the players current victory collection
  updatePlayerCurrentChallengeVictories(playerName, selectedChallenge, victories) {
    this.playerCurrentVictories = victories + 1;
    this.db.object(`scores/${playerName}/challengeFriend/${selectedChallenge}`).update({ "victories": this.playerCurrentVictories });

    this.checkVictoriesAchievements(selectedChallenge, playerName, this.playerCurrentVictories);

    this.userCurrentVictories = 0;
  }

  // When the player has a previous win in the selected challenge, 
  // we need to get how many victories the player has. 
  compareChildToFindVictories(playerName, selectedChallenge) {

    var setPlayerCurrentChallengeVictories = (childData) => {
      var victories = childData;
      this.updatePlayerCurrentChallengeVictories(playerName, selectedChallenge, victories);

    }
    this.db.database.ref("scores/" + playerName + "/challengeFriend/" + selectedChallenge).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "victories") {
            if (childData == undefined) {
              childData = 0;
            }
            setPlayerCurrentChallengeVictories(childData);
          }
        });
      });
  }

  // Need this function to see if the player has already one victory in the 
  // seleceted challenge. If not a new victory collectio creates for the seleceted challenge.
  compareChildToChallenges(playerName, selectedChallenge, loopingChallenge, numberOfChild) {

    // Need to counter the child so we can create a challenge if it is neccessary. 
    // The counterChild starts on 1 because it the field challengeFriend has one child from beginning
    // go file setusername.ts to see which attributes that is given to the user from start. 
    this.counterChild = this.counterChild + 1;

    // if key is the right challenge, we will update the victories at the opponent. 
    if (loopingChallenge == selectedChallenge) {
      this.compareChildToFindVictories(playerName, loopingChallenge);
      // This means that we don't need to create a challenge, it already exist.
      this.challengeFind = true;
    }

    // Creates a challenge if the opponent does not has this challenge yet. Important that we have loop 
    // through all the children first. 
    else if (this.challengeFind == false && numberOfChild == this.counterChild) {
      this.createChallenge(playerName, selectedChallenge);
    }
  }


  // Function that loopes all the challenges the player has a victory collection in. 
  getPlayersCurrentChallengeVictories(playerName, selectedChallenge) {

    var setAmountOfChild = (key, numberOfChild) => {

      var loopingChallenge = key;
      var numberChild = numberOfChild
      this.compareChildToChallenges(playerName, selectedChallenge, loopingChallenge, numberChild);
    }

    this.db.database.ref("scores/" + playerName + "/challengeFriend").once("value")
      .then(function (snapshot) {
        let numberOfChild = snapshot.numChildren();

        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          setAmountOfChild(key, numberOfChild);
        });
      });
  }


  updateBothPlayersCurrentScore(playerName, totScore, currentScore, whichUser, winner) {

    var amountOfPoints = 0;

    //Need to see which player who won to determine the amounts of points.
    // User is marked as number 1, Opponent is marked as number 2. 
    if (winner == whichUser) {
      amountOfPoints = 200;
    }
    // Number 3 means that it is a tie between the players. 
    else if (winner == 3) {
      amountOfPoints = 200;
    }
    else {
      //amountOfPoints = 150;
      amountOfPoints = 200;
    }

    // The user
    if (whichUser == 1) {
      this.userCurrentScore = currentScore
      let newTot = totScore + amountOfPoints;
      this.userCurrentScore = this.userCurrentScore + amountOfPoints;
      this.db.object(`scores/${playerName}/points`).update({ "score": this.userCurrentScore });
      this.db.object(`scores/${playerName}/points`).update({ "totalScore": newTot });
      this.achievementChecker.checkPointStatus(playerName, newTot, this.userCurrentScore);

    }

    //The opponent 
    else if (whichUser == 2) {
      this.opponentCurrentScore = currentScore
      let newTot = totScore + amountOfPoints;
      this.opponentCurrentScore = this.opponentCurrentScore + amountOfPoints;
      this.db.object(`scores/${playerName}/points`).update({ "score": this.opponentCurrentScore });
      this.db.object(`scores/${playerName}/points`).update({ "totalScore": newTot });
      this.achievementChecker.checkPointStatus(playerName, newTot, this.userCurrentScore);
    }

    if (winner == 1) {
      this.toastr.success('Congratulations to the victory! You got 200 points and plus one victory in the challenge ' + this.selectedChallenge, 'Challenge a friend');
      this.db.object(`inbox/${this.challengerName}/challenge${this.username}`).update({ "info": "Defeat", "message": "You lost in " + this.selectedChallenge + " vs " + this.username });
    }
    else if (winner == 2) {
      this.toastr.success('You have unfortunately lost but gain 200 points for playing', 'Challenge a friend');
      this.db.object(`inbox/${this.challengerName}/challenge${this.username}`).update({ "info": "Victory!", "message": "You won in " + this.selectedChallenge + " vs " + this.username });
    }
    else if (winner == 3) {
      this.toastr.success('How exciting! It was a draw, both get 200 points but no one wins. ', 'Challenge a friend');
      this.db.object(`inbox/${this.challengerName}/challenge${this.username}`).update({ "info": "Tie", "message": "You tied in " + this.selectedChallenge + " vs " + this.username });
    }
  }

  // Get both players score. Need to have variable winner so 
  // that players gets extra points. 
  getBothPlayersScore(username, challengerName, winner) {
    // User is marked as number 1
    var getUserScore = (tot, curr) => {
      var score = curr;
      var totScore = tot;
      var user = 1;
      this.updateBothPlayersCurrentScore(username, tot, score, user, winner);
    }
    // opponent is marked as number 2
    var getOpponentScore = (tot, curr) => {
      var score = curr;
      var totScore = tot;
      var opponent = 2;
      this.updateBothPlayersCurrentScore(challengerName, tot, score, opponent, winner);
    }


    var totScore, currScore = 0;
    // For the user
    this.db.database.ref("scores/" + username + "/points").once("value")
      .then(function (snapshot) {
        totScore = currScore = 0;
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "score") {
            if (childData == undefined) {
              currScore = 0;
            } else {
              currScore = childData;
            }
          } else if (key == "totalScore") {
            if (childData == undefined) {
              totScore = 0;
            } else {
              totScore = childData;
            }
          }

        });
        getUserScore(totScore, currScore);
      });
    // For the opponent
    this.db.database.ref("scores/" + challengerName + "/points").once("value")
      .then(function (snapshot) {
        totScore = currScore = 0;
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "score") {
            if (childData == undefined) {
              currScore = 0;
            } else {
              currScore = childData;
            }
          } else if (key == "totalScore") {
            if (childData == undefined) {
              totScore = 0;
            } else {
              totScore = childData;
            }
          }
        });
        getOpponentScore(totScore, currScore);
      });
  }

  comparisonPlayersAmounts(usersAmount, opponentAmount) {
    usersAmount = Number(usersAmount);  
    opponentAmount = Number(opponentAmount);  

    // User won 
    if (usersAmount > opponentAmount) {
      var won = 1;
      this.getBothPlayersScore(this.username, this.challengerName, won);
      this.getPlayersCurrentChallengeVictories(this.username, this.selectedChallenge);
      this.resetVariables();
      this.setFinishChallenge("won");
      this.deleteCurrentChallenge(this.username, this.challengerName);

    }
    // opponent won
    else if (usersAmount < opponentAmount) {

      //Need a variable to determine who player that gets extra points.
      var lost = 2;
      this.getBothPlayersScore(this.username, this.challengerName, lost);
      this.getPlayersCurrentChallengeVictories(this.challengerName, this.selectedChallenge);

      this.resetVariables();
      //this.setFinishChallenge("amountChallenge");
      this.deleteCurrentChallenge(this.username, this.challengerName);
    }

    // tie between the players
    else if (usersAmount == opponentAmount) {
      //Need a variable to determine who player that gets extra points.
      var tie = 3;
      this.getBothPlayersScore(this.username, this.challengerName, tie);
      this.resetVariables();
      this.deleteCurrentChallenge(this.username, this.challengerName);
    }
  }

  /****************** END General functions************** */

  /****************** sendAmount() ************** */

  sendAmount() {
    //this.finishChallenge = true;
    //this.resetVariables();
    //Check so the user only uses numeric and not letters. 
    if (isNaN(this.userAmount)) {
      this.toastr.error('Wrong input, please enter only numbers! ', 'Submit');
    }
    else {

      var userFirstToSetChallengeStatus = () => {
        /* Need to send the magic number 3, because in updateChallengeStatus() we determine
         which player who is the winner depending of numbers.
         Number 1 is the user, number 2 is the opponent. 
        In this type of challenge we don't know which the winner is yet, therefore number 3. */
        this.updateChallengeStatus(this.username, this.challengerName, 3, this.challengeType);
        // Needed for change the layout at the html page. 
        this.finishChallenge = true;
      }

      var setUserAmountAndSendBothPlayersAmount = (opponentsAmount) => {
        this.db.object(`userChallenges/${this.username}/current/${this.challengerName}`).update({ "amount": this.userAmount });
        // Need finishChallenge for change the layout at the html page. 
        this.finishChallenge = true;
        this.comparisonPlayersAmounts(this.userAmount, opponentsAmount);
      }

      var getWhichTypeChallengeIs = (challengeTypeFromFirebase) => {
        this.challengeType = challengeTypeFromFirebase;
      }

      this.db.database.ref("challenges/challengeFriend/" + this.selectedChallenge).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            if (key == "type") {
              getWhichTypeChallengeIs(childData);
            }
          });
        });

      this.db.database.ref("userChallenges/" + this.challengerName + "/current/" + this.username).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            if (key == "amount") {

              // If the user has choice that he/she won and the opponent has choice he/she lost we can
              // give points to the winner. 
              if (childData == "") {
                userFirstToSetChallengeStatus();
              }

              // If both players hacve choose the same choice, we reset both options. 
              else {
                // Sets the user amount 
                setUserAmountAndSendBothPlayersAmount(childData);
              }
            }
          });
        });
    }
  }
  /****************** SendGameLost ************** */
  SendGameLost() {

    // When the user has lost the challenge
    var userLost = () => {
      //Need a variable to determine who player that gets extra points.
      var lost = 2;
      this.achievementChecker.checkChallengeAFriend(this.username);
      this.achievementChecker.checkChallengeAFriend(this.challengerName);
      this.getBothPlayersScore(this.username, this.challengerName, lost);
      this.getPlayersCurrentChallengeVictories(this.challengerName, this.selectedChallenge);
      this.resetVariables();
      this.setFinishChallenge("lost");
      this.deleteCurrentChallenge(this.username, this.challengerName);
    }

    // When the user is the first to set the challenge status of the two players
    var userFirstToSetChallengeStatus = () => {
      // Set the opponent to number 2. 
      var winner = 2;
      this.updateChallengeStatus(this.username, this.challengerName, 2, this.challengeType);
      this.setFinishChallenge("lost");
    }

    // When both players has set the same challenge option.
    var bothPlayersHasSetSameOption = () => {
      this.resetVariables();
      this.resetChallengeStatus(this.username, this.challengerName);
    }

    var getWhichTypeChallengeIs = (challengeTypeFromFirebase) => {
      this.challengeType = challengeTypeFromFirebase;
    }
 
    this.db.database.ref("challenges/challengeFriend/" + this.selectedChallenge).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "type") {
            getWhichTypeChallengeIs(childData);
          }
        });
      });

    this.db.database.ref("userChallenges/" + this.challengerName + "/current/" + this.username).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "victoryStatus") {

            // If the user has choice that he/she won and the opponent has choice he/she lost we can
            // give points to the winner. 
            if (childData == "won") {

              userLost();
            }

            // If the opponent has not respond yet we set the users choice.
            else if (childData == "") {
              userFirstToSetChallengeStatus();
            }

            // If both players have choose the same choice, we reset both options. 
            else {
              bothPlayersHasSetSameOption();
            }
          }
        });
      });

  }

  /*******************SendGameWon()********************* */

  sendGameWon() {

    // When the user has lost the challenge
    var userWon = () => {
      //Need variable to determine which player that gets extra points.
      var won = 1;
      this.achievementChecker.checkChallengeAFriend(this.username);
      this.achievementChecker.checkChallengeAFriend(this.challengerName);
      this.getBothPlayersScore(this.username, this.challengerName, won);
      this.getPlayersCurrentChallengeVictories(this.username, this.selectedChallenge);
      this.resetVariables();
      this.setFinishChallenge("won");
      this.deleteCurrentChallenge(this.username, this.challengerName);
    }

    // When the user is the first to set the challenge status of the two players
    var userFirstToSetChallengeStatus = () => {
      // Set the user to number 1. 
      var winner = 1;
      this.updateChallengeStatus(this.username, this.challengerName, winner, this.challengeType);
      this.setFinishChallenge("won");
    }
    this
    // When both players has set the same challenge option.
    var bothPlayersHasSetSameOption = () => {
      this.resetVariables();
      this.resetChallengeStatus(this.username, this.challengerName);
    }

    var getWhichTypeChallengeIs = (challengeTypeFromFirebase) => {
      this.challengeType = challengeTypeFromFirebase;
    }

    this.db.database.ref("challenges/challengeFriend/" + this.selectedChallenge).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "type") {
            getWhichTypeChallengeIs(childData);
          }
        });
      });

    this.db.database.ref("userChallenges/" + this.challengerName + "/current/" + this.username).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();

          if (key == "victoryStatus") {

            // If the user has choice that he/she won and the opponent has choice he/she lost we can
            // give points to the winner. 
            if (childData == "lost") {
              userWon();
            }

            // If the opponent has not respond yet we set the users choice.
            else if (childData == "") {
              userFirstToSetChallengeStatus();
            }

            // If both players hacve choose the same choice, we reset both options. 
            else {
              bothPlayersHasSetSameOption();
            }
          }
        });
      });
  }

  /********* Selected challenge. Important functions  ***********/
  acceptChallenge(challengerName, challenge, time, date, location) {

    var setChallengeType = (challengeType) => {
      if (challengeType == "won/lost") {
        this.db.object(`userChallenges/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "victoryStatus": "" });
        this.db.object(`userChallenges/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "victoryStatus": "" });

        this.db.object(`userChallenges/${challengerName}/current/${this.username}`).update({ "challengeInformation": { "time": time, "date": date, "location": location } });
        this.db.object(`userChallenges/${this.username}/current/${challengerName}`).update({ "challengeInformation": { "time": time, "date": date, "location": location } });
      }
      else if (challengeType == "amount") {
        this.db.object(`userChallenges/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
        this.db.object(`userChallenges/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
      }
      else if (challengeType == "time") {
        this.db.object(`userChallenges/${challengerName}/current/${this.username}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
        this.db.object(`userChallenges/${this.username}/current/${challengerName}`).update({ "accepted": true, "challenge": challenge, "amount": "" });
      }
    }

    this.db.database.ref("challenges/challengeFriend/" + challenge).once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "type") {
            setChallengeType(childData);
          }
        });
      });
    this.db.object(`userChallenges/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallenges/${challengerName}/outgoing/${this.username}`).remove();
  }

  declineChallenge(challengerName) {
    this.db.object(`userChallenges/${this.username}/incoming/${challengerName}`).remove();
    this.db.object(`userChallenges/${challengerName}/outgoing/${this.username}`).remove();
  }


  selectChallenge(challengeName, challengerName) {
    this.challengerName = challengerName;
    this.selectedChallenge = challengeName;

    this.getChallengeStatus();
    this.setChallengeType();
    this.getChallengesInformation();

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
