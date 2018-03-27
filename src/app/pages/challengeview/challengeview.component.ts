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
    this.getUserChallenges();
  }

  acceptChallenge() {

  }

  declineChallenge() {
    
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
          console.log(snap.key);
          var key = childSnap.key;
          var childData = childSnap.val();
          var challengeObject = { challenger: key, challenge: childData["challenge"] };
          if(snap.key == "incoming") {
            addIncomingToList(challengeObject);
          } else if(snap.key == "outgoing") {
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
