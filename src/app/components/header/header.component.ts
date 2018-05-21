
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
  ListOfIncomingChallengeAFriend = [];
  ListOfIncomingChallengeWithAFriend = [];
  username: string = "";
  challengeCounterChallengeAFriend: number = 0; 
  challengeCounterChallengeWithAFriend: number = 0; 

  constructor(private db: AngularFireDatabase,private router: Router, private authService: AuthService) {

  }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getUserChallengeAFriend();
    this.getUserChallengeWithAFriend();
  }

  logout() {
    localStorage.removeItem("localuserName");
    this.printUsername=null;
    this.challengeCounterChallengeAFriend = 0; 
    this.challengeCounterChallengeWithAFriend = 0; 
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
  goToChallengeWithFriend() {
    if (this.printUsername == null) { 
      this.router.navigateByUrl('/gameInformation');
    }
    else 
    this.router.navigateByUrl('/challengeViewWithFriend');
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
  goToStatistics() {
    this.router.navigateByUrl('/statistics');
  }

   //Updates the user's challenge overview in realtime, could perhaps be more elegant...
   getUserChallengeAFriend() {
    var addIncomingToList = (challenge) => { this.ListOfIncomingChallengeAFriend.push(challenge) };

    let query = "userChallenges/" + this.username;
    let currentList = "";
    this.db.database.ref(query).on("value", (snapshot) => {
      this.ListOfIncomingChallengeAFriend = [];
      snapshot.forEach((snap) => {
        snap.forEach((childSnap) => {
          var key = childSnap.key;
          var childData = childSnap.val();
          var challengeObject = { challenger: key, challenge: childData["challenge"] };
          if(snap.key == "incoming") {
            addIncomingToList(challengeObject);
          } 
          this.challengeCounterChallengeAFriend = this.ListOfIncomingChallengeAFriend.length;
          return false;
        });
        return false;
      });
    });
  }

  getUserChallengeWithAFriend() {
    var addIncomingToList = (challenge) => { this.ListOfIncomingChallengeWithAFriend.push(challenge) };

    let query = "userChallengesWithFriend/" + this.username;
    let currentList = "";
    this.db.database.ref(query).on("value", (snapshot) => {
      this.ListOfIncomingChallengeWithAFriend = [];
      snapshot.forEach((snap) => {
        snap.forEach((childSnap) => {
          var key = childSnap.key;
          var childData = childSnap.val();
          var challengeObject = { challenger: key, challenge: childData["challenge"] };
          if(snap.key == "incoming") {
            addIncomingToList(challengeObject);
          } 
          this.challengeCounterChallengeWithAFriend = this.ListOfIncomingChallengeWithAFriend.length;
          return false;
        });
        return false;
      });
    });
  }
}
