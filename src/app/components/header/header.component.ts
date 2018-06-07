
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { ToastrService } from 'ngx-toastr';


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

  constructor(private toastr: ToastrService, private db: AngularFireDatabase,private router: Router, private authService: AuthService) {

  }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    this.getUserChallengeAFriend();
    this.getUserChallengeWithAFriend();
    this.getInboxMessages();
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
    /* TODO implement bettet settings page 
    this.router.navigateByUrl('/settings');
    */ 
  }
  goToStatistics() {
    this.router.navigateByUrl('/statistics');
  }

  goToHealthInformation() {
    this.router.navigateByUrl('/health');
  }

   //Updates the user's challenge overview in realtime, could perhaps be more elegant...
   getUserChallengeAFriend() {
    var addIncomingToList = (challenge) => {
      this.ListOfIncomingChallengeAFriend.push(challenge); 
    };
    var resetChallengeCounter = () => {
      this.challengeCounterChallengeAFriend = 0;
      this.ListOfIncomingChallengeAFriend = [];
    };

    let query = "userChallenges/" + this.username;
    let currentList = "";
    this.db.database.ref(query).on("value", (snapshot) => {
      resetChallengeCounter();
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



  getInboxMessages() {
    var displayMessage = (msg, info) => {
      this.toastr.info(msg, info);
    }
    var removeMessage = (msgName) => {  
      this.db.object(`inbox/${this.username}/${msgName}`).remove();
    }
    let query = "inbox/"+this.username;
    var message = "";
    var info = "";
    var msgName = ""; 
    this.db.database.ref(query).on("value", (snapshot) => {
      snapshot.forEach((snap) => {
          msgName = snap.key;
          if(snap.key != "placeholder") {
            snap.forEach((childSnap) => {   
              var key = childSnap.key;
              var childData = childSnap.val();
              if(key == "message") {
                message = childData;
              } else {
                info = childData;
              }
              return false;
            });

            displayMessage(message, info);
            removeMessage(msgName);
          } 
          return false;
      });
    });
  }

  getUserChallengeWithAFriend() {
    var addIncomingToList = (challenge) => { 
      this.ListOfIncomingChallengeWithAFriend.push(challenge) 
    };

    var resetChallengeCounter = () => {
      this.challengeCounterChallengeWithAFriend = 0;
      this.ListOfIncomingChallengeWithAFriend = [];
    };

    let query = "userChallengesWithFriend/" + this.username;
    let currentList = "";   

    this.db.database.ref(query).on("value", (snapshot) => {
      resetChallengeCounter();
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
    }, function(error){
      console.log(error);
    });
  }
}
