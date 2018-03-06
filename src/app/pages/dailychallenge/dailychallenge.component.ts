import { Component, OnInit } from '@angular/core';
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
})




export class DailychallengeComponent implements OnInit {
  //Timer variables
  timerValue = 0.00;
  counter: number = 0;
  timerId: string;
  timer = false;
  time = 0;

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
    var randomNumber = this.getRandomInt(3);

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
  }

  initiateChallenge() {
    this.st.newTimer('secondCounter', 0.0001);
    this.timerId = this.st.subscribe('secondCounter', () => this.incrementTime());
  }
  

  finishChallenge() {
    console.log("Complete!");
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
