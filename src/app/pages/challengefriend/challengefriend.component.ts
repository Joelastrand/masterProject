import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import {DialogModule} from 'primeng/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-challengefriend',
  templateUrl: './challengefriend.component.html',
  styleUrls: ['./challengefriend.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class ChallengefriendComponent implements OnInit {
  selectedChallenge: string = "";
  username: string = "";
  usernameExists: boolean;
  listOfChallenges = [];
  display: boolean = false;

  ListOfChallengesObservable: Observable<any[]>;

  constructor(private db: AngularFireDatabase, public auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.getListOfChallenges();
  }
  
  showDialog() {
    this.display = true;
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
  }
  returnToChallengeView() {
    this.selectedChallenge = "";
  }

  getListOfChallenges() {
    var addChallengeToList = (challenge) => {this.listOfChallenges.push(challenge)};
    this.db.database.ref("challenges/challengeFriend").once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        var challengeObject = {name: childData.name, description: childData.description};
        addChallengeToList(challengeObject);
      });
    });
  }

  sendChallenge() {
    let senderName = localStorage.getItem("localuserName");
    let receiverName = this.username;

    if(senderName != receiverName) {  
      this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge}); //update outgoing for sender
      this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
      this.showDialog();
    } else {
      console.log("Unsupported action");
    }
  
  }

}
