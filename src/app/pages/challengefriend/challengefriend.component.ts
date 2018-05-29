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
  usernameExists: boolean;
  listOfChallenges = [];
  display: boolean = false;
  showDropdown: boolean = false;
  challengeTypeWonLost: boolean = false;
  users;
  ListOfChallengesObservable: Observable<any[]>;
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

  toggleChallengeInformationDialog() {
    this.ChallengeInformationDialog == false ? this.ChallengeInformationDialog = true : this.ChallengeInformationDialog = false;
  }

  setTimeVariables() {
    var d = new Date();
    var hours; 
    var minutes; 
    this.challengeDate = (d.getDate()) + "/"  + (d.getMonth() + 1);
    hours = (d.getHours() + 1);
    minutes = d.getMinutes();
    if(minutes<10)
    {
      this.challengeTime = hours.toString() + ":0"+minutes.toString(); 
    }
    else {
      this.challengeTime = hours.toString() + ":"+minutes.toString(); 
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



  changeChallengeInformation () {
    var dateFormat = /[\d/]/;
    var timeFormat = /[\d:]/;
    if (!(dateFormat.test(this.challengeDate)) || (!(timeFormat.test(this.challengeTime))) || (!this.challengeTime)  || (!this.challengeLocation)) {
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

  selectUser(val) {
    this.username = val;
    this.checkUsername();
    this.userForm.patchValue({ "search": val });
    this.closeDropdown();
    
  }
  
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
          this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({"time": this.challengeTime,"date": this.challengeDate,"location": this.challengeLocation}); //update outgoing for sender
    
          this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
          this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({"time": this.challengeTime,"date": this.challengeDate,"location": this.challengeLocation}); //Update incoming for receiver
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
