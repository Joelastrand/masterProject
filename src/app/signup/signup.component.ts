import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from "../models/user";
import { Router } from '@angular/router';

import {DialogModule} from 'primeng/dialog';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  retypedPassword = "";
  user = {} as User;
  errorMessage = "";

  constructor(private afAuth: AngularFireAuth, private router: Router,) { }

  ngOnInit() {
  }

  display: boolean = false;

  showDialog() {
    this.display = true;
  }

  goToHome() {
    this.display = false;
    this.router.navigateByUrl('/home');    
  }

  translateErrorMessage(msg) {
    switch(msg) {
      case " First argument \"email\" must be a valid string.":
        this.errorMessage = "Please enter your email-address in the format yourname@example.com";
      break;
      case "The email address is badly formatted.":
        this.errorMessage = "Please enter your email-address in the format yourname@example.com";
      break;
      default:
        this.errorMessage = "The passwords need to match and be a minimum of 6 characters";
  }
}


  async register(user: User) {
    try{
      if(user.password != this.retypedPassword || user.password.length < 6 || this.retypedPassword.length < 6) {
        user.password = "";
        this.retypedPassword = "";
      }
        const result = await this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
        document.getElementById("errorMsg").style.color="green";
        this.errorMessage = "Successfully created account with email " + result.email;
        this.showDialog();
    } catch (e){
      if(e.message.indexOf(':') > -1) {
        document.getElementById("errorMsg").style.color="red";
        this.translateErrorMessage(e.message.split(":",2)[1]);
      } else {
        document.getElementById("errorMsg").style.color="red";
        this.translateErrorMessage(e.message);
      }

    }
    
  }

}
