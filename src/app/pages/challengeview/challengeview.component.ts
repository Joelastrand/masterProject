import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Observable } from 'rxjs/Observable';

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


  constructor(private db: AngularFireDatabase, public auth: AuthService) { }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getIncomingChallenges();
  }


  getIncomingChallenges() {
    var addIncomingToList = (challenge) => {this.ListOfIncomingChallenges.push(challenge)};
    let query = "userChallenges/"+this.username+"/incoming"
    this.db.database.ref(query).once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        var challengeObject = {challenger: key, challenge: childData["challenge"]};
        addIncomingToList(challengeObject);
      });
    });
  }

  getOutgoingChallenges() {
    var addOutgoingToList = (challenge) => {this.ListOfIncomingChallenges.push(challenge)};
    let query = "userChallenges/"+this.username+"/outgoing"
    this.db.database.ref(query).once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        var challengeObject = {challenger: key, challenge: childData["challenge"]};
        addOutgoingToList(challengeObject);
      });
    });
  }


  getCurrentChallenges() {
    var addCurrentToList = (challenge) => {this.ListOfIncomingChallenges.push(challenge)};
    let query = "userChallenges/"+this.username+"/current"
    this.db.database.ref(query).once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        var challengeObject = {challenger: key, challenge: childData["challenge"]};
        addCurrentToList(challengeObject);
      });
    });
  }


}
