import { Component, OnInit, trigger, state, animate, transition, style } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SimpleTimer } from 'ng2-simple-timer';
import { OnChanges } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/map";

@Component({
  selector: 'app-dailychallenge',
  templateUrl: './dailychallenge.component.html',
  styleUrls: ['./dailychallenge.component.scss'],
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

  //Timer variables
  timerValue = 0.00;
  counter: number = 0;
  timerId: string;
  timer = false;
  time = 0;
  timerOn = false;

  //Challenge variables
  challengeName = "";
  challengeParameters = {};
  

  constructor(private st: SimpleTimer, private db: AngularFireDatabase) { }

  ngOnInit() {
    

  }

  fetchRandomChallenge() {  
    var list = [];
    var query = this.db.database.ref("challenges/dailyChallenges").orderByKey();
    var count = 0;
    var randomNumber = this.getRandomInt(1);

    var setName = (name) => {this.setChallengeName(name)};
    var setChallengeParams = (para) => {this.setChallengeParameter(para)};

    query.once("value")
    .then(function(snapshot) {    
      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        if(randomNumber == count) {
          setName(key);
          setChallengeParams(childData);
        }
        count ++;    
      });
    });
  }


  getRandomChallenge() {
    this.fetchRandomChallenge();
    this.showGetChallengeButton = 0;
  }

  initiateChallenge() {
    this.timerOn = true;
    this.st.newTimer('secondCounter', 0.00001);
    this.timerId = this.st.subscribe('secondCounter', () => this.incrementTime());
  }
  

  finishChallenge() {
    console.log("Complete!");
  }


  pauseTimer() {
    this.timerOn = false;
    this.st.unsubscribe(this.timerId);
  }

  resumeTimer() {
    this.st.subscribe('secondCounter', () => this.incrementTime());
  }


  incrementTime() {
    this.counter++;
    var maxTimerValue = this.time*60;
    this.timerValue = (this.counter / maxTimerValue) * 100;
    if (this.counter >= maxTimerValue) {
      this.st.unsubscribe(this.timerId);
      this.st.delTimer('secondCounter');
      this.finishChallenge();
    }
  }

  
  setChallengeName(name: any = null): any{
    this.challengeName = String(name);
  }
  setChallengeParameter(param: any = null): any{
    this.challengeParameters = param;
    if(this.challengeParameters["Timer"]) {
      this.timer = this.challengeParameters["Timer"];
      this.time = this.challengeParameters["Time"];
    }
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

}
