import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import "rxjs";

import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class AuthService {


  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase) { }
  private currentUser: firebase.User = null;
  userName = "";

  logout() {
    this.afAuth.auth.signOut().then(function() {
      //console.log("signOut");
    }, function(error) {
      console.log(error);
    } );
  }

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

  async getUserID() {

    const userID = await this.afAuth.auth.currentUser.uid;
    localStorage.setItem("localuserID", "userID");
    return userID;
  }

  getUsers(): FirebaseListObservable<any> {
    return this.db.list('/usernames');
  }

  /*
  getUserName() {
    var userID: string;
    var setUserID = (ID) => {
      
    };
    this.getUserID().then(function(ey){
      setUserID(ey);
    });
    console.log(this.db.object(`users/${userID}/username`));
    return this.db.object(`users/${userID}/username`);    
  }
  */

}
