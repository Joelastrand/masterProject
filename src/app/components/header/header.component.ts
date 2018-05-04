
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class HeaderComponent implements OnInit {
  printUsername=null;
  ListOfIncomingChallenges = [];
  username: string = "";
  challengeCounter: number = 0; 

  constructor(private db: AngularFireDatabase,private router: Router, private authService: AuthService) {

  }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getUserChallenges();
  }

  logout() {
    localStorage.removeItem("localuserName");
    this.printUsername=null;
    this.challengeCounter = 0; 
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  isLoggedOut() {
    this.printUsername = localStorage.getItem("localuserName");
    if (this.printUsername == null) {
      return true;
    }
    else
    return false;
  }

  goToStartPage() {
    this.router.navigateByUrl('');
  }
  goToCreateAccount() {
    this.router.navigateByUrl('/signup');
  }
  goToLogIn() {
    this.router.navigateByUrl('/login');
  }
  goToDaily() {
    if (this.printUsername == null) { 
      this.router.navigateByUrl('/gameInformation');
    }
    else
    this.router.navigateByUrl('/dailyChallenge');
  }
  goToChallengeView() {
    if (this.printUsername == null) { 
      this.router.navigateByUrl('/gameInformation');
    }
    else 
    this.router.navigateByUrl('/challengeview');
  }
  goToSettings() {
    this.router.navigateByUrl('/settings');
  }

   //Updates the user's challenge overview in realtime, could perhaps be more elegant...
   getUserChallenges() {
    var addIncomingToList = (challenge) => { this.ListOfIncomingChallenges.push(challenge) };

    let query = "userChallenges/" + this.username;
    let currentList = "";
    this.db.database.ref(query).on("value", (snapshot) => {
      this.ListOfIncomingChallenges = [];
      snapshot.forEach((snap) => {
        snap.forEach((childSnap) => {
          var key = childSnap.key;
          var childData = childSnap.val();
          var challengeObject = { challenger: key, challenge: childData["challenge"] };
          if(snap.key == "incoming") {
            addIncomingToList(challengeObject);
          } 
          this.challengeCounter = this.ListOfIncomingChallenges.length;
          return false;
        });
        return false;
      });
    });
  }
}
