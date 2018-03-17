import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';

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

  ListOfChallengesObservable: Observable<any[]>;

  constructor(private db: AngularFireDatabase, public auth: AuthService) { }

  ngOnInit() {
    this.getListOfChallenges();
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
    console.log(this.username);
    console.log(localStorage.getItem("localuserName"));
  }

 /* getListOfChallenges(listPath): Observable<any[]> {
    return this.db.list(listPath).subscribe(); // valueChanges();
  }*/
}
