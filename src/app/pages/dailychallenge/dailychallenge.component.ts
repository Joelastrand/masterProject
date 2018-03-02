import { Component, OnInit } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SimpleTimer } from 'ng2-simple-timer';
import { OnChanges } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-dailychallenge',
  templateUrl: './dailychallenge.component.html',
  styleUrls: ['./dailychallenge.component.scss'],
})



export class DailychallengeComponent implements OnInit {
  timerValue = 0.00;
  maxTimerValue = 1800;
  counter: number = 0;
  timerId: string;
  timerVisibility = "hidden";
  randomChallengeName: string;
  listOfChallenges: [{"hej"}];
  constructor(private st: SimpleTimer, private db: AngularFireDatabase) { }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  pickRandomProperty() {  
    var list = [];
    var query = this.db.database.ref("challenges/dailyChallenges").orderByKey();
    query.once("value")
    .then(function(snapshot) {    
      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        var challengeObject = {key, childData};
        list.push(challengeObject);
      
      });
    });
    return list;
  }

  
  ngOnInit() {
    var challengeList = [];
    var randomNumber = this.getRandomInt(3);
    challengeList = this.pickRandomProperty();
    console.log(challengeList);
    console.log(challengeList[0]);
    console.log(challengeList[randomNumber]);
    console.log(randomNumber);
    //this.challengeList = this.getLeaderboard('/challenges/dailyChallenges/');
   // console.log(this.pickRandomProperty(this.challengeList));
 
  }


  incrementTime() {
    this.counter++;
    this.timerValue = (this.counter / this.maxTimerValue) * 100;
    if (this.counter >= this.maxTimerValue) {
      this.st.unsubscribe(this.timerId);
      this.st.delTimer('secondCounter');
    }
  }

  getRandomChallenge() {
    this.timerVisibility = this.timerVisibility == "hidden" ? "shown" : "hidden";
  }

  initiateChallenge() {
    this.st.newTimer('secondCounter', 0.001);
    this.timerId = this.st.subscribe('secondCounter', () => this.incrementTime());
  }

  finishChallenge() {

  }

}
