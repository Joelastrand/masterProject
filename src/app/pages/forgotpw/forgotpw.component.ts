import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from "../../models/user";
import { Router } from '@angular/router';

import {DialogModule} from 'primeng/dialog';

@Component({
  selector: 'app-forgotpw',
  templateUrl: './forgotpw.component.html',
  styleUrls: ['./forgotpw.component.scss']
})
export class ForgotpwComponent implements OnInit {
  user = {} as User;
  display: boolean = false;
  errorMessage = "";

  constructor(private afAuth: AngularFireAuth, private router: Router) { }

  translateErrorMessage(msg) {
    switch(msg) {
      case " First argument \"email\" must be a valid string.":
        this.errorMessage = "Please enter your email-address in the format yourname@example.com";
      break;
      case "The email address is badly formatted.":
        this.errorMessage = "Please enter your email-address in the format yourname@example.com";
      break;
      default:
        this.errorMessage = "There is no user registered with that email-address";
    }
  }

  showDialog() {
    this.display = true;
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  async sendResetLink(user: User) {
    try {
      const result = await this.afAuth.auth.sendPasswordResetEmail(user.email);
      if(result == undefined) {
        this.showDialog();
      }
    } catch(e) {
      if(e.message.indexOf(':') > -1) {
        document.getElementById("errorMsg").style.color="red";
        this.translateErrorMessage(e.message.split(":",2)[1]);
      } else {
        document.getElementById("errorMsg").style.color="red";
        this.translateErrorMessage(e.message);
      }
    }
  }

  ngOnInit() {
  }

}
