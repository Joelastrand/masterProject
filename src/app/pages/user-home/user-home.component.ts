import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../auth.service';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Router } from '@angular/router';



@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class UserHomeComponent implements OnInit {

  user: string;
  userID: string;
  userName: string;




  constructor(private router: Router, private db: AngularFireDatabase, private userService: UserService, private authService: AuthService) { }

  isLoggedIn() {

    //Need to have the localsStorage because the auth request to the Firebase takes to long time.
    var printUsername = localStorage.getItem("localuserName");

    if (printUsername != null) {
      document.getElementById("printUserName").innerHTML = "Welcome " + printUsername;
      return true;
    }
    else
      return false;
  }

  ngOnInit() {
    this.getTheName();
  }

  redirectToDailyChallenge() {
    this.router.navigate(['./dailyChallenge']);
  }
  redirectToStatistics() {
    this.router.navigate(['./statistics']);
  }

  redirectToChallengeFriend() {
    this.router.navigate(['./challengefriend']);
  }



  getTheName() {
    var setUserName = (newName) => {
      this.userName = newName;
      localStorage.setItem("localuserName", this.userName);
    };

    var getName = (ID) => {
      this.db.database.ref(`/users/${ID}/username`).once("value").then(function (snapshot) {
        setUserName(snapshot.val());
      });
    };

    this.authService.getUserID().then(function (userID) {
      getName(userID);
    });

  }
}
