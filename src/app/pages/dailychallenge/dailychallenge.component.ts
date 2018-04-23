import { Component, OnInit, trigger, state, animate, transition, style } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SimpleTimer } from 'ng2-simple-timer';
import { OnChanges } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from "../../auth.service";
import {DialogModule} from 'primeng/dialog';
import { Router } from '@angular/router';

import "rxjs/add/operator/map";
import { forEach } from '@firebase/util';

@Component({
  selector: 'app-dailychallenge',
  templateUrl: './dailychallenge.component.html',
  styleUrls: ['./dailychallenge.component.scss'],
  providers: [AuthService, AngularFireDatabase],
  animations: [
    trigger('timer', [
      state('true', style({
        opacity: 1,
        display: "flex"
      })),
      state('false', style({
        opacity: 0,
        display: "none"
      })),
      transition('false => true', animate('1000ms ease-in')),
    ]),
    trigger('sequence', [
      state('true', style({
        opacity: 1,
        display: "flex"
      })),
      state('false', style({
        opacity: 0,
        display: "none"
      })),
      transition('false => true', animate('1000ms ease-in')),
    ]),
    trigger('getChallengeButton', [
      state('1', style({
        opacity: 1,
        display: "flex"
      })),
      state('0', style({
        opacity: 0,
        display: "none"
      })),
      transition('1 => 0', animate('2ms ease-out')),
    ]),
    trigger('challengeInfo', [
      state('0', style({
        opacity: 1,
        display: "flex"
      })),
      state('1', style({
        opacity: 0,
        display: "none"
      })),
      transition('1 => 0', animate('1000ms ease-in')),
    ])
  ]
})




export class DailychallengeComponent implements OnInit {
  //Animation triggers
  showGetChallengeButton = 1;
  challengeFinished = false;
  displayFinishChallengeDialog: boolean = false;

  //Sequence variables
  sequence = false;
  sequenceList = [];
  sequenceStarted = false;
  exerciseIndex = 0;

  //Timer variables
  timerValue = 0.00;
  counter: number = 0;
  timerId: string;
  timer = false;
  time = 0;
  timerOn = false;

  //Challenge variables
  challengeName = "";
  dailyChallengeStreak = 0;
  dailyChallengeTotal = 0;
  challengeParameters = {};
  username: string;

  constructor(private router: Router, private afAuth: AngularFireAuth, private st: SimpleTimer, private db: AngularFireDatabase) { }

  async getUser() {
    /*const res = await this.auth.getUserName().subscribe(uname => {
      this.username = uname.$value;
    });*/

  }

  ngOnInit() {
    this.username = localStorage.getItem("localuserName");
    //this.getUser();
  }

  goToStart() {
    this.displayFinishChallengeDialog = false;
    this.router.navigateByUrl('');    
  }
  
  fetchRandomChallenge() {
    var list = [];
    var query = this.db.database.ref("challenges/dailyChallenges").orderByKey();
    var count = 0;
    var randomNumber = this.getRandomInt(2); //TODO: Change to the number of challenges in database, sry for hardcode

    var setName = (name) => { this.setChallengeName(name) };
    var setChallengeParams = (para) => { this.setChallengeParameter(para) };

    query.once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (randomNumber == count /*String(key)=="ExerciseSequence"*/) {
            setName(key);
            setChallengeParams(childData);
          }
          count++;
        });
      });
  }


  getRandomChallenge() {

    var d = new Date();
    var date = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

    var challengeNotDoneToday = () => {
      this.fetchRandomChallenge();
      this.showGetChallengeButton = 0;
    };
    var challengeDoneToday = () => {
      console.log("Challenge has already been completed today"); //TODO: SKRIV UT ATT CHALLENGE REDAN ÄR KLAR, gör i init?
    };

    //Checks if daily challenge has been made today
    this.db.database.ref("scores/" + this.username + "/dailyChallenge/date").once("value")
      .then(function (snapshot) {
        if (new Date(snapshot.val()).getTime() != new Date(date).getTime() + 1) {
          challengeNotDoneToday();
        } else {
          challengeDoneToday();
        }
      });

  }

  
  initiateSequence() {
    this.sequenceStarted = true;
  }

  initiateChallenge() { //Called when "play-button" pressed

    if (this.timer) {
      this.timerOn = true;
      this.st.newTimer('secondCounter', 0.00001);
      this.timerId = this.st.subscribe('secondCounter', () => this.incrementTime());
    }

  }


  finishChallenge() {
    this.challengeFinished = true;
    this.updateDailyChallenge();
    this.displayFinishChallengeDialog = true;
    
  }

  updateDailyChallenge() {
    //Increments streak and total and updates "date" to current date
    var d = new Date();
    var date = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

    var updateStreak = (newStreak) => { 
      this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "streak": newStreak });
      this.dailyChallengeStreak = newStreak;
    };

    var updateTotal = (newTotal) => {
      this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "total": newTotal });
      this.dailyChallengeTotal = newTotal;
    };

    var newTotal, newStreak =  0;
    this.db.database.ref("scores/" + this.username + "/dailyChallenge/").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if(childSnapshot.key == "total") {
            newTotal = childSnapshot.val()+1;
          } else if(childSnapshot.key == "streak") {   
            newStreak = childSnapshot.val()+1;     
          }
          if(newTotal == undefined) {
            newTotal = 1;
          }
          if(newStreak == 0) {
            newStreak = 1;
          }       
        });
        updateTotal(newTotal);
        updateStreak(newStreak);
      });
    this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "date": date });
  }

  nextExerciseInSequence() {
    if(this.sequenceList.length-1 > this.exerciseIndex) {
      this.exerciseIndex +=1;
    }   
  }

  previousExerciseInSequence() {
    this.exerciseIndex -=1;
  }

  pauseTimer() {
    this.timerOn = false;
    this.st.unsubscribe(this.timerId);
  }


  incrementTime() {
    this.counter++;
    var maxTimerValue = this.time * 60;
    this.timerValue = (this.counter / maxTimerValue) * 100;
    if (this.counter >= maxTimerValue) {
      this.st.unsubscribe(this.timerId);
      this.st.delTimer('secondCounter');
      this.finishChallenge();
    }
  }

  setChallengeName(name: any = null): any {
    this.challengeName = String(name);
  }


  setChallengeParameter(param: any = null): any {
    this.challengeParameters = param;
    //TODO: Continue this when adding more types of challenges
    if (this.challengeParameters["Timer"]) { //Parameters if timer
      this.timer = this.challengeParameters["Timer"];
      this.time = this.challengeParameters["Time"];
    } else if (this.challengeParameters["Sequence"]) { //Parameter if sequence
      this.sequence = this.challengeParameters["Sequence"];
      for (var key in this.challengeParameters["Exercises"]) {
        var exerciseObject = { name: key, repeats: this.challengeParameters["Exercises"][key] };
        this.sequenceList.push(exerciseObject);

      }

    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }


}
