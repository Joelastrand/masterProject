import { Component, OnInit, HostBinding } from '@angular/core';
import { AngularFireList } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { User } from "../../models/user";
import { AuthService } from '../../auth.service';

import { UserService } from '../../service/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss'
  ],
  providers: [AuthService, AngularFireDatabase],
})


export class LoginComponent implements OnInit {

  currentUser: string;
  editUser: string;

  userID: string;
  userName: string;

  errorMessage = "";
  user = {} as User;
  constructor(private router: Router, private afAuth: AngularFireAuth, private userService: UserService, private db: AngularFireDatabase, private authService: AuthService) { }

  ngOnInit() {
    // Make so the page starts on top. 
    window.scrollTo(0, 0);
  }

  goToSignup() {
    this.router.navigateByUrl('/signup');
  }

  goToForgotPw() {
    this.router.navigateByUrl('/forgotpassword');
  }

  translateErrorMessage(msg) {
    switch (msg) {
      case " First argument \"email\" must be a valid string.":
        this.errorMessage = "Please enter your email-address in the format yourname@example.com";
        break;
      case "There is no user record corresponding to this identifier. The user may have been deleted.":
        this.errorMessage = "There is no user registered with that email-address";
        break;
      default:
        this.errorMessage = "Invalid password";

    }
  }

  async login(user: User) {
    try {
      const result = await this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
      if (result) {
        this.userService.editUser(this.user.email);
        this.getTheName();
        this.router.navigateByUrl('/home');

      }
    } catch (e) {
      if (e.message.indexOf(':') > -1) {
        document.getElementById("errorMsg").style.color = "red";
        this.translateErrorMessage(e.message.split(":", 2)[1]);
      } else {
        document.getElementById("errorMsg").style.color = "red";
        this.translateErrorMessage(e.message);
      }
    }
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
