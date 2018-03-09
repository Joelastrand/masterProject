import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import "rxjs";

import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class AuthService {


  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase) { }

  userName = "";

  checkUsername(username: string) {
    username = username.toLowerCase()
    return this.db.object(`usernames/${username}`)
  }

  updateUsername(username: string) {
    let data = {}
    data[username] = this.afAuth.auth.currentUser.uid;
    this.db.object(`/users/${this.afAuth.auth.currentUser.uid}`).update({ "username": username })
    this.db.object(`/usernames`).update(data)
  }

  getUserID() {
    var userID: string;
    //console.log(userID);
    userID = this.afAuth.auth.currentUser.uid;
    return userID;
  }

  getUserName() {
    var userID: string;
    userID = this.getUserID();
    const setUserName = (newName) => { this.userName = newName };
    return this.db.object(`users/${userID}/username`);
  }

}
