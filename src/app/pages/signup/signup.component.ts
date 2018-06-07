import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from "../../models/user";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class SignupComponent implements OnInit {
  retypedPassword = "";
  user = {} as User;
  errorMessage = "";
  display: boolean = false;
  counter = 0;

  constructor( public auth: AuthService, private toastr: ToastrService, private db: AngularFireDatabase, private afAuth: AngularFireAuth, private router: Router, ) { }

  ngOnInit() {
    // Make so the page starts on top. 
    window.scrollTo(0, 0);
  }

  showDialog() {
    this.display = true;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async goToSetusername() {
    this.display = false;
    //await this.sleep(400);
    this.router.navigateByUrl('/setusername');
  }

  translateErrorMessage(msg) {
    switch (msg) {
      case " First argument \"email\" must be a valid string.":
        this.errorMessage = "Please enter your email-address in the format yourname@example.com";
        break;
      case "The email address is badly formatted.":
        this.errorMessage = "Please enter your email-address in the format yourname@example.com";
        break;
      case "The email address is already in use by another account.":
        this.errorMessage = "Invalid email or password";
        break;
      default:
        this.errorMessage = "The passwords need to match and be a minimum of 6 characters.Spaces is not allowed. ";
    }
  }

  async setUsername(email) {
      var i = email.indexOf("@");
      let uname = "";

      if(i > 0) {
        uname = email.slice(0,i);
      } else {
        uname = email;
      }

      const res = await this.auth.checkUsername(uname).subscribe(username => {
        if(!username.$value) {
          this.auth.updateUsername(uname);
        } 
      });
  }


  async register(user: User) {
    // Format for testing that the password is not contain of any spaces.
    var passwordFormat = /^\S*$/;
    try {
      if (!(passwordFormat.test(user.password)) || user.password != this.retypedPassword || user.password.length < 6 || this.retypedPassword.length < 6) {
        user.password = "";
        this.retypedPassword = "";
      }
      const result = await this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
      user.uid = result.uid;
      document.getElementById("errorMsg").style.color = "green";
      this.errorMessage = "Successfully created account with email " + result.email;
      this.toastr.success('Successfully created account with email' + result.email, 'Account Created');
      
      //this.setUsername(result.email);
      this.goToSetusername();
     
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

}
