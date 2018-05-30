import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-challengefriend',
  templateUrl: './challengefriend.component.html',
  styleUrls: ['./challengefriend.component.scss'],
  providers: [AuthService, AngularFireDatabase],
})
export class ChallengefriendComponent implements OnInit {

  challengeLocation: string = "";
  challengeDate: string = "";
  challengeTime: string = "";
  selectedChallenge: string = "";
  username: string = "";
  otherPlayersName: string = "";
  usernameExists: boolean;
  listOfChallenges = [];
  display: boolean = false;
  showDropdown: boolean = false;
  challengeTypeWonLost: boolean = false;
  users;
  ListOfChallengesObservable: Observable<any[]>;
  ChallengeInformationDialog: boolean = false;
  userForm: FormGroup;

  // Warning the user if they already has a challenge together. 
  playersAlreadyHasACurrentChallenge: boolean = false;
  playersAlreadyHasAOutgoingChallenge: boolean = false;
  playersAlreadyHasAIncomingChallenge: boolean = false;
  counterChild: number = 0;
  numberOfChild: number = 0;
  currentUsername: string = "";

  constructor(private toastr: ToastrService, private db: AngularFireDatabase, public auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.initForm();
    this.setTimeVariables();
  }

  initForm(): FormGroup {
    return this.userForm = this.fb.group({
      search: [null]
    })
  }

  toggleChallengeInformationDialog() {
    this.ChallengeInformationDialog == false ? this.ChallengeInformationDialog = true : this.ChallengeInformationDialog = false;
  }

  setTimeVariables() {
    var d = new Date();
    var hours;
    var minutes;
    this.challengeDate = (d.getDate()) + "/" + (d.getMonth() + 1);
    hours = (d.getHours() + 1);
    minutes = d.getMinutes();
    if (minutes < 10) {
      this.challengeTime = hours.toString() + ":0" + minutes.toString();
    }
    else {
      this.challengeTime = hours.toString() + ":" + minutes.toString();
    }
    this.challengeLocation = "At the reception"
  }

  // Need this to change the html page depending of which challenge it is. 
  setChallengeType() {
    var setType = (challengeType) => {
      if (challengeType == "won/lost") {
        this.challengeTypeWonLost = true;
      }
      else {
        this.challengeTypeWonLost = false;
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
        });
      });
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
      this.toastr.success('You have change the information ', 'Submit');
      this.toggleChallengeInformationDialog();
    }
  }

  getSearchValue() {
    return this.userForm.value.search;
  }

  ngOnInit() {
    this.getListOfChallenges();
    this.auth.getUsers().subscribe(users => this.users = users);
  }

  showDialog() {
    //this.display = true;
    this.toastr.success('Challenge has been sent!', 'Challenge a friend');
    this.router.navigateByUrl('/challengeview');
  }

  closeDropdown() {
    this.showDropdown = false;
  }
  openDropdown() {
    this.showDropdown = true;
  }

  /*********************************************
    Check so the user don't send to himself or warning of user already 
     playing against opponent*/

  canSendChallenge(userInput) {
    if (!(this.playersAlreadyHasACurrentChallenge) && !(this.playersAlreadyHasAOutgoingChallenge) && !(this.playersAlreadyHasAIncomingChallenge)) {
      this.username = userInput;
      this.checkUsername();
      this.userForm.patchValue({ "search": userInput });
      this.closeDropdown();
      this.counterChild = 0;
      this.numberOfChild = 0;
      this.playersAlreadyHasACurrentChallenge = false;
      this.playersAlreadyHasAOutgoingChallenge = false;
      this.playersAlreadyHasAIncomingChallenge = false;
    }

    else {
      this.playersAlreadyHasACurrentChallenge = false;
      this.playersAlreadyHasAOutgoingChallenge = false;
      this.playersAlreadyHasAIncomingChallenge = false;
    }
  }


  checkIfPlayerExistInChallengeList(opponentName, numberOfChild, userInput, whichList) {
    // Need to loop through all players the user plays against.
    this.counterChild = this.counterChild + 1;
    this.currentUsername = localStorage.getItem("localuserName");

    // Find the opponent in the user challenge list
    if (userInput == opponentName) {

      if (whichList == "/current") {
        this.playersAlreadyHasACurrentChallenge = true;
        this.toastr.warning('You can only play 1 challenge at a time to the same player. You already have a current challenge against this player, if you send this challenge it is going to be overwritten.', 'Challenge with a friend');
      }
      else if (whichList == "/outgoing") {
        this.playersAlreadyHasAOutgoingChallenge = true;
        this.toastr.warning('You can only play 1 challenge at a time to the same player. If you send this challenge the previous challenge you have sent is going to be overwritten.', 'Challenge with a friend');

      }
      else if (whichList == "/incoming") {
        this.playersAlreadyHasAIncomingChallenge = true;
        this.toastr.warning('You can only play 1 challenge at a time to the same player. If you send this challenge the incoming challenge you have is going to be overwritten.', 'Challenge with a friend');
      }
      this.username = userInput;
      this.checkUsername();
      this.userForm.patchValue({ "search": userInput });
      this.closeDropdown();
      this.counterChild = 0;
      this.numberOfChild = 0;
      //Need to send it so it all variables resets. 
      this.canSendChallenge(userInput);

    }
    else if (this.playersAlreadyHasACurrentChallenge == false && this.numberOfChild == this.counterChild) {
      // Need to reset the counter to next loop.
      this.counterChild = 0;
      this.numberOfChild = 0;
      //this.getOutgoingChallengeListChildren(userInput);
      this.canSendChallenge(userInput);
    }
  }

  selectUser(val) {
    this.currentUsername = localStorage.getItem("localuserName");

    // Need to check if the user already has a challenge against the player he/she challenge.
    var sendToCheckIfPlayerExistInList = (opponentName, localNumberOfChild, whichList) => {
      this.numberOfChild = (localNumberOfChild);
      this.checkIfPlayerExistInChallengeList(opponentName, this.numberOfChild, val, whichList)
    }

    var setNotEmptyList = () => {
      emptyList = false;
    }


    var emptyList = true;

    var getNumberOfChildrenInList = (whichList) => {
      this.db.database.ref("userChallenges/" + this.currentUsername + whichList).once("value")
        .then(function (snapshot) {
          setNotEmptyList();
          let numberOfChild = snapshot.numChildren();
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            sendToCheckIfPlayerExistInList(key, numberOfChild, whichList);
          });
        });
    }

    getNumberOfChildrenInList("/current");
    getNumberOfChildrenInList("/outgoing");
    getNumberOfChildrenInList("/incoming");

    // If the user does not have any challenge yet.
    if (emptyList) {
      this.canSendChallenge(val);
    }

    // If the user tries to play against herself/himself
    if (this.currentUsername == val) {
      this.toastr.error('ehmm, you can not challenge yourself..Try again against a friend!', 'Challenge with a friend');
    }
  }
 /******************END**********************************/

 
  goToChallengeOverview() {
    this.display = false;
    this.router.navigateByUrl('/challengeview');
  }


  async checkUsername() {
    this.username = this.username.toLowerCase();
    const res = await this.auth.checkUsername(this.username).subscribe(username => {
      this.usernameExists = username.$value
    });
  }


  selectChallenge(name) {
    this.selectedChallenge = name;
    this.setChallengeType();
  }
  returnToChallengeView() {
    this.selectedChallenge = "";
  }

  getListOfChallenges() {
    var addChallengeToList = (challenge) => { this.listOfChallenges.push(challenge) };
    this.db.database.ref("challenges/challengeFriend").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          var challengeObject = { name: childData.name, description: childData.description };
          addChallengeToList(challengeObject);
        });
      });
  }

  sendChallenge() {

    let senderName = localStorage.getItem("localuserName");
    let receiverName = this.username;

    if (senderName != receiverName) {

      var setChallengeType = (challengeType) => {
        if (challengeType == "won/lost") {

          this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
          this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //update outgoing for sender

          this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
          this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //Update incoming for receiver
        }
        else if (challengeType == "amount") {
          this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
          this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
        }
        else if (challengeType == "time") {
          this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
          this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
        }
      }

      this.db.database.ref("challenges/challengeFriend/" + this.selectedChallenge).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "type") {
              setChallengeType(childData);
            }
          });
        });
      /*  
      this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
      this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({"time": this.challengeTime,"date": this.challengeDate,"location": this.challengeLocation}); //update outgoing for sender
  
      this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
      this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({"time": this.challengeTime,"date": this.challengeDate,"location": this.challengeLocation}); //Update incoming for receiver
        */
      this.showDialog();
    } else {
      console.log("Unsupported action");
    }
  }

}
