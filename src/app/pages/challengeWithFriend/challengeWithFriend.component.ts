import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-challengeWithFriend',
  templateUrl: './challengeWithFriend.component.html',
  styleUrls: ['./challengeWithFriend.component.scss'],
  providers: [AuthService, AngularFireDatabase],
})
export class ChallengeWithFriendComponent implements OnInit {

  selectedChallenge: string = "";
  username: string = "";
  usernameExists: boolean;
  listOfChallenges = [];
  display: boolean = false;
  showDropdown: boolean = false;
  users;
  ListOfChallengesObservable: Observable<any[]>;

  playerIsFind: boolean = false;
  counterChild: number = 0;
  numberOfChild: number = 0;
  currentUsername: string = "";

  challengeDescription: string ="";
  challengeLocation: string = "";
  challengeDate: string = "";
  challengeTime: string = "";
  challengeTypeWonLost: boolean = false;
  ChallengeInformationDialog: boolean = false;
  userForm: FormGroup;

  constructor(private toastr: ToastrService, private db: AngularFireDatabase, public auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.initForm();
    this.setTimeVariables();

  }

  initForm(): FormGroup {
    return this.userForm = this.fb.group({
      search: [null]
    })
  }

  /******Challenge information START *************/

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

  /******Challenge information END *************/

  getSearchValue() {
    return this.userForm.value.search;
  }

  ngOnInit() {
    this.getListOfChallenges();
    this.auth.getUsers().subscribe(users => this.users = users);
  }


  showDialog() {
    //this.display = true;
    this.toastr.success('Challenge has been sent!', 'Challenge With a friend');
    this.router.navigateByUrl('/challengeViewWithFriend');
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

  checkIfPlayerExistInChallengeList(opponentName, numberOfChild, userInput, whichList) {
    // Need to loop through all players the user plays against.
    this.counterChild = this.counterChild + 1;
    this.currentUsername = localStorage.getItem("localuserName");

    // Find the opponent in the user challenge list
    if (userInput == opponentName) {

      if (whichList == "/current" || whichList == "/outgoing" || whichList == "/incoming") {
        this.playerIsFind = true;
        this.toastr.warning('You can only play 1 challenge at a time to the same player. The previous challenge with this player is going to be overwritten when he/she accepted the new challenge.', 'Challenge With a friend');
        this.router.navigateByUrl('/challengeViewWithFriend');
      }

    }
    else if (this.playerIsFind == false && this.numberOfChild == this.counterChild) {
      // Need to reset the counter to next loop.
      this.counterChild = 0;
      this.numberOfChild = 0;
      this.playerIsFind = false;
      this.showDialog();
    }
  }

  selectUser(val) {
    this.username = val;
    this.checkUsername();
    this.userForm.patchValue({ "search": val });
    this.closeDropdown();

  }

  /******************END**********************************/

  goToChallengeWithFriendOverview() {
    this.display = false;
    this.router.navigateByUrl('/challengeViewWithFriend');
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
    this.db.database.ref("challenges/challengeWithFriend").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (childData.level == "hard") {
            childData.level = 400;
          }
          else if (childData.level == "medium") {
            childData.level = 300;
          }
          else {
            childData.level = 200;
          }
          var challengeObject = { name: childData.name, description: childData.description, level: childData.level };
          addChallengeToList(challengeObject);
        });
      });
  }

  setChallengeTypeToUsers(challengeType, senderName, receiverName) {
    if (challengeType == "won/lost") {

      this.db.object(`userChallengesWithFriend/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
      this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //update outgoing for sender

      this.db.object(`userChallengesWithFriend/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
      this.db.object(`userChallengesWithFriend/${receiverName}/incoming/${senderName}`).update({ "time": this.challengeTime, "date": this.challengeDate, "location": this.challengeLocation }); //Update incoming for receiver
    }
    else if (challengeType == "amount") {
      this.db.object(`userChallengesWithFriend/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
      this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
    }
    else if (challengeType == "time") {
      this.db.object(`userChallengesWithFriend/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
      this.db.object(`userChallengesWithFriend/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
    }
  }

  sendChallenge() {

    let senderName = localStorage.getItem("localuserName");
    let receiverName = this.username;

    if (senderName != receiverName) {

      // Need to check if the user already has a challenge against the player he/she challenge.
      var sendToCheckIfPlayerExistInList = (opponentName, localNumberOfChild, whichList) => {
        this.numberOfChild = (localNumberOfChild);
        this.checkIfPlayerExistInChallengeList(opponentName, this.numberOfChild, receiverName, whichList)
      }

      var emptyList = true;

      var setNotEmptyList = () => {
        emptyList = false;
      }

      var getNumberOfChildrenInList = (whichList) => {
        this.db.database.ref("userChallengesWithFriend/" + senderName + whichList).once("value")
          .then(function (snapshot) {
            let numberOfChild = snapshot.numChildren();
            snapshot.forEach(function (childSnapshot) {
              // If the user does not have any challenge yet.
              setNotEmptyList();
              var key = childSnapshot.key;
              var childData = childSnapshot.val();
              sendToCheckIfPlayerExistInList(key, numberOfChild, whichList);
            });
          });
      }

      getNumberOfChildrenInList("/current");
      getNumberOfChildrenInList("/outgoing");
      getNumberOfChildrenInList("/incoming");


      var sendChallengeIfListIsEmpty = () => {
        // If the user does not have any challenge yet.
        if (emptyList) {
          this.showDialog();
        }
      }

      var getChallengeType = (challengeType) => {
        this.setChallengeTypeToUsers(challengeType, senderName, receiverName);
      }

      this.db.database.ref("challenges/challengeWithFriend/" + this.selectedChallenge).once("value")
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if (key == "type") {
              getChallengeType(childData);
              sendChallengeIfListIsEmpty();
            }
          });
        });


      /*
      this.db.object(`userChallengesWithFriend/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
      this.db.object(`userChallengesWithFriend/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
      this.showDialog();
      */

    } else {
      this.toastr.error('ehmm, you can not challenge yourself..Try again with a friend!', 'Challenge With a friend');
      //console.log("Unsupported action");
    }
  }

}
