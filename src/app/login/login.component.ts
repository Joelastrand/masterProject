import { Component, OnInit, HostBinding } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { User } from "../models/user";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss'
  ]
})


export class LoginComponent implements OnInit {

  errorMessage = "";
  user = {} as User;
  constructor(private router: Router, private afAuth: AngularFireAuth) { }

  ngOnInit() {
  }

  goToSignup() {
    this.router.navigateByUrl('/signup');    
  }
  
  async login(user: User) {
    try {
      const result = await this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
      console.log(result);
      if(result) {
        this.router.navigateByUrl('/home');
      }
    } catch(e) {
      if(e.message.indexOf(':') > -1) {
        document.getElementById("errorMsg").style.color="red";
        this.errorMessage = e.message.split(":",2)[1];
        //console.error(e.message.split(":",2)[1]);
      } else {
        //console.error(e);
        document.getElementById("errorMsg").style.color="red";
        this.errorMessage = e.message;
      }
  }
  }
}
