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
import { AchievementCheckerService } from "../../achievement-checker.service";
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import "rxjs/add/operator/map";
import { forEach } from '@firebase/util';

@Component({
  selector: 'app-dailychallenge',
  templateUrl: './dailychallenge.component.html',
  styleUrls: ['./dailychallenge.component.scss'],
  providers: [AuthService, AchievementCheckerService, AngularFireDatabase],
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
    ]),
  ]
})




export class DailychallengeComponent implements OnInit {
  //Animation triggers
  showGetChallengeButton = 1;
  challengeFinished = false;
  displayFinishChallengeDialog: boolean = false;
  showExerciseDialog: boolean = false;

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
  completedChallenges = 0;
  dailyChallengeStreak = 0;
  dailyChallengeTotal = 0;
  numberOfChallenges = [];
  challengeParameters = {};
  username: string;
  usertotalScore = 0;
  userCurrentScore: number = 0;

  constructor(private achievementChecker: AchievementCheckerService, private toastr: ToastrService, private router: Router, private afAuth: AngularFireAuth, private st: SimpleTimer, private db: AngularFireDatabase) { }



  ngOnInit() {
    // Make so the page starts on top. 
    window.scrollTo(0, 0);
    this.username = localStorage.getItem("localuserName");
    this.getDailyChallengeValues();

  }

  goToStart() {
    this.router.navigateByUrl('');
  }

  toggleExerciseDialog() {
    this.showExerciseDialog == false ? this.showExerciseDialog = true : this.showExerciseDialog = false;
  }

  /*
   showFinishChallengeDialog() {
 
     var newStreak = this.dailyChallengeStreak +1 ;
     var newTotal = this.dailyChallengeTotal + 1;
     this.toastr.success('Current streak: ' + newStreak + '<br>' + 'Total daily challenges done: ' + newTotal, 'Nicely done!');
     
   } */

  showChallengeDoneDialog() {

    this.toastr.warning('Daily challenge already completed today!', 'Daily Challenge');

  }


  fetchRandomChallenge() {
    var list = [];
    var query = this.db.database.ref("challenges/dailyChallenges").orderByKey();
    var count = 0;
    var randomNumber = this.getRandomInt(5); //TODO: Change to the number of challenges in database, sry for hardcode

    var setName = (name) => { this.setChallengeName(name) };
    var setChallengeParams = (para) => { this.setChallengeParameter(para) };

    query.once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (randomNumber == count /* String(key) == "Exercise Sequence"*/) {
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
      this.showChallengeDoneDialog();
      //console.log("Challenge has already been completed today"); 
    };

    //Checks if daily challenge has been made today
    this.db.database.ref("scores/" + this.username + "/dailyChallenge/date").once("value")
      .then(function (snapshot) {
        if (new Date(snapshot.val()).getTime() != new Date(date).getTime()) { //ADD PLUS ONE WHEN TESTING
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
      this.st.newTimer('secondCounter', 1);
      this.timerId = this.st.subscribe('secondCounter', () => this.incrementTime());
    }

  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dealyedNagivation() {
    //await this.sleep(500);
    this.router.navigateByUrl('');
  }

  finishChallenge() {
    console.log("finishChallenge");
    this.challengeFinished = true;
    this.updateDailyChallenge();
    this.getUserCurrentScore();
    this.dealyedNagivation();
  }


  // Get and updates the user points. 
  getUserCurrentScore = () => {

    var updateUsersPoints = (currentScore) => {
      this.userCurrentScore = currentScore + 250;
      this.achievementChecker.checkPointStatus(this.username, 0, this.userCurrentScore);
      this.db.object(`scores/${this.username}/points`).update({ "score": this.userCurrentScore });
    }

    var updateUsersTotalPoints = (currentTotal) => {
      let newTotal = currentTotal + 250;
      this.usertotalScore = newTotal;
      this.achievementChecker.checkPointStatus(this.username, newTotal, 0);
      this.db.object(`scores/${this.username}/points`).update({ "totalScore": newTotal });
    }

    this.db.database.ref("scores/" + this.username + "/points").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "score") {
            if (childData == undefined) {
              childData = 0;
            }
            updateUsersPoints(childData);
          } else {
            if (childData == undefined) {
              childData = 0;
            }
            updateUsersTotalPoints(childData);
          }
        });
      });
  }

  getDailyChallengeValues() {
    var setStreak = (newStreak) => {
      this.dailyChallengeStreak = newStreak;

    };

    var setTotal = (newTotal) => {
      this.dailyChallengeTotal = newTotal;
    };

    var total, streak = 0;
    this.db.database.ref("scores/" + this.username + "/dailyChallenge/").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (childSnapshot.key == "total") {
            total = childSnapshot.val();
          } else if (childSnapshot.key == "streak") {
            streak = childSnapshot.val();
          }
          if (total == undefined) {
            total = 0;
          }
          if (streak == 0) {
            streak = 0;
          }
        });
        setTotal(total);
        setStreak(streak);
      });
  }
  updateDailyChallenge() {
    // Need yesterday date and todays dates so we can compare if the streaks is valid
    var yesterdaysDate = new Date();
    yesterdaysDate.setDate(yesterdaysDate.getDate() - 1);
    var yesterdayDate = "" + yesterdaysDate.getFullYear() + "-" + (yesterdaysDate.getMonth() + 1) + "-" + (yesterdaysDate.getDate());

    var fridayDate = new Date();
    fridayDate.setDate(fridayDate.getDate() - 3);
    var friday = "" + fridayDate.getFullYear() + "-" + (fridayDate.getMonth() + 1) + "-" + (fridayDate.getDate());

    var d = new Date();
    var weekday = d.getDay();
    var todaysDate = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

    var checkIfStreakIsValid = (latestChallengeDate) => {

      // The streak is valid and it contiune to grow
      if (latestChallengeDate == yesterdayDate) {
        this.dailyChallengeStreak = this.dailyChallengeStreak + 1;
        var newTotal = this.dailyChallengeTotal + 1;
        this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "streak": this.dailyChallengeStreak, "total": newTotal, "date": todaysDate });
        this.toastr.success('Current streak: ' + this.dailyChallengeStreak + '<br>' + 'Total daily challenges done: ' + newTotal, 'Nicely done!');
        this.achievementChecker.checkDailyStatus(this.username, (this.dailyChallengeStreak));

      }

      // If the players challenge each other more then once per day 
      else if (latestChallengeDate == todaysDate) {
        // Nothing happen to the streak, it remains but don't grows. 
        var newTotal = this.dailyChallengeTotal + 1;
        this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "total": newTotal });
        this.toastr.success('Current streak: ' + this.dailyChallengeStreak + '<br>' + 'Total daily challenges done: ' + newTotal, 'Nicely done!');

      }

      else if (weekday == 1 && latestChallengeDate == friday) {
        this.dailyChallengeStreak = this.dailyChallengeStreak + 1;
        var newTotal = this.dailyChallengeTotal + 1;
        this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "streak": this.dailyChallengeStreak, "total": newTotal, "date": todaysDate });
        this.toastr.success('Current streak: ' + this.dailyChallengeStreak + '<br>' + 'Total daily challenges done: ' + newTotal, 'Nicely done!');
        this.achievementChecker.checkDailyStatus(this.username, (this.dailyChallengeStreak));
      }

      // The streak has terminated and a new streaks begin
      else {
        if (weekday == 0 || weekday == 6) {
          //The streaks remains because the day is Sunday or Saturday. 
          var newTotal = this.dailyChallengeTotal;
          this.toastr.success('But because it is on the weekend you streak does not get any longer. Current streak: ' + this.dailyChallengeStreak + '<br>' + 'Total daily challenges done: ' + newTotal, 'Great done!');
        }

        else {
          var newTotal = this.dailyChallengeTotal + 1;
          this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "streak": 1, "date": todaysDate, "total": newTotal });
          this.toastr.success('Current streak: 1 ' + '<br>' + 'Total daily challenges done: ' + newTotal, 'Nicely done!');

        }
      }
    }

    var createNewStreak = () => {
      this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "streak": 1, "date": todaysDate, "total": 1 });
      this.toastr.success('Current streak: 1 ' + '<br>' + 'Total daily challenges done: 1', 'Nicely done!');
      this.achievementChecker.checkDailyStatus(this.username, 1);
    }

    this.db.database.ref("scores/" + this.username + "/dailyChallenge/").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (key == "date") {
            checkIfStreakIsValid(childData);
          }
          else if (key == "streak") {
            if (childData == 0) {
              createNewStreak();
            }
          }
        });
      });
    /*
    //Increments streak and total and updates "date" to current date
    var d = new Date();
    var date = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate());
    var newStreak = this.dailyChallengeStreak + 1;
    var newTotal = this.dailyChallengeTotal + 1;
    this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "streak": newStreak });
    this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "total": newTotal });
    this.db.object(`/scores/${this.username}/dailyChallenge`).update({ "date": date });
    */
  }

  nextExerciseInSequence() {
    var currentElement = <HTMLElement>document.getElementsByClassName("numberCircle")[this.exerciseIndex];
    currentElement.style.background = '#3e8e41';
    currentElement.style.border = '2px solid gray';

    currentElement.style.height = '26px';
    currentElement.style.width = '26px';
    currentElement.style['font-size'] = '18px';


    if (this.sequenceList.length - 1 > this.exerciseIndex) {
      var nextElement = <HTMLElement>document.getElementsByClassName("numberCircle")[this.exerciseIndex + 1];
      nextElement.style.border = 'solid 2px #1985A1';
      nextElement.style.height = '32px';
      nextElement.style.width = '32px';
      nextElement.style['font-size'] = '22px';

      this.completedChallenges += 1;
      this.exerciseIndex += 1;
    } else if (this.sequenceList.length - 1 == this.exerciseIndex) {
      this.completedChallenges += 1;
      if (this.completedChallenges >= 0) { //Fix this if we want a minimum finish challenge limit
        this.finishChallenge();
      }
      currentElement.style.border = 'solid 2px #1985A1';
    }
  }
  skipExercise() {
    var currentElement = <HTMLElement>document.getElementsByClassName("numberCircle")[this.exerciseIndex];
    currentElement.style.background = 'red';
    currentElement.style.border = '2px solid gray';

    currentElement.style.height = '26px';
    currentElement.style.width = '26px';
    currentElement.style['font-size'] = '18px';

    if (this.sequenceList.length - 1 > this.exerciseIndex) {
      var nextElement = <HTMLElement>document.getElementsByClassName("numberCircle")[this.exerciseIndex + 1];
      nextElement.style.border = 'solid 2px #1985A1';

      nextElement.style.height = '32px';
      nextElement.style.width = '32px';
      nextElement.style['font-size'] = '22px';

      this.exerciseIndex += 1;
    } else if (this.sequenceList.length - 1 == this.exerciseIndex) {
      if (this.completedChallenges >= 0) { //Fix this if we want a minimum finish challenge limit
        this.finishChallenge();
      }
      currentElement.style.border = 'solid 2px #1985A1';
    }
  }

  previousExerciseInSequence() {

    if (this.exerciseIndex > 0) {
      var currentElement = <HTMLElement>document.getElementsByClassName("numberCircle")[this.exerciseIndex];
      currentElement.style.border = '2px solid gray';

      currentElement.style.height = '26px';
      currentElement.style.width = '26px';
      currentElement.style['font-size'] = '18px';

      var prevElement = <HTMLElement>document.getElementsByClassName("numberCircle")[this.exerciseIndex - 1];
      prevElement.style.border = 'solid 2px #1985A1';
      prevElement.style.height = '32px';
      prevElement.style.width = '32px';
      prevElement.style['font-size'] = '22px';

      this.exerciseIndex -= 1;
    }

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
      this.challengeName = "Exercise Sequence";
      this.sequence = this.challengeParameters["Sequence"];
      var counter = 0;
      var exerName, exerDesc = "";
      var reps = 0;
      for (var key in this.challengeParameters["Exercises"]) {
        for (var value in this.challengeParameters["Exercises"][key]) {
          if (value == "name") {
            exerName = this.challengeParameters["Exercises"][key][value];
          } else if (value == "description") {
            exerDesc = this.challengeParameters["Exercises"][key][value];
          } else {
            reps = this.challengeParameters["Exercises"][key][value];
          }

        }
        var exerciseObject = { name: exerName, repeats: reps, desc: exerDesc };
        this.sequenceList.push(exerciseObject);
        counter++;
      }

      this.numberOfChallenges = Array(counter - 1);
    }

  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }


}
