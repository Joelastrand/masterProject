import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from "../../auth.service";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-challengefriend',
  templateUrl: './challengefriend.component.html',
  styleUrls: ['./challengefriend.component.scss'],
  providers: [AuthService, AngularFireDatabase],
})
export class ChallengefriendComponent implements OnInit {

  selectedChallenge: string = "";
  username: string = "";
  usernameExists: boolean;
  listOfChallenges = [];
  display: boolean = false;
  showDropdown: boolean = false;
  users;
  ListOfChallengesObservable: Observable<any[]>;

  userForm: FormGroup;

  constructor(private toastr: ToastrService, private db: AngularFireDatabase, public auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.initForm();
  }

  initForm(): FormGroup {
    return this.userForm = this.fb.group({
      search: [null]
    })
  }

  getSearchValue() {
    return this.userForm.value.search;
  }

  ngOnInit() {
    this.getListOfChallenges();
    this.auth.getUsers().subscribe(users => this.users = users);
  }

  showDialog() {
    //this.display = true;
    this.toastr.success('Challenge has been sent!', 'Challenge a friend');
    this.router.navigateByUrl('/challengeview');
  }

  closeDropdown() {
    this.showDropdown = false;
  }
  openDropdown() {
    this.showDropdown = true;
  }

  selectUser(val) {
    this.username = val;
    this.checkUsername();
    this.userForm.patchValue({ "search": val });
    this.closeDropdown();
    
  }
  
  goToChallengeOverview() {
    this.display = false;
    this.router.navigateByUrl('/challengeview');
  }
  

  async checkUsername() {
    this.username = this.username.toLowerCase();
    const res = await this.auth.checkUsername(this.username).subscribe(username => {
      this.usernameExists = username.$value
    });
  }

  selectChallenge(name) {
    this.selectedChallenge = name;
  }
  returnToChallengeView() {
    this.selectedChallenge = "";
  }

  getListOfChallenges() {
    var addChallengeToList = (challenge) => { this.listOfChallenges.push(challenge) };
    this.db.database.ref("challenges/challengeFriend").once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          var challengeObject = { name: childData.name, description: childData.description };
          addChallengeToList(challengeObject);
        });
      });
  }

  sendChallenge() {

    let senderName = localStorage.getItem("localuserName");
    let receiverName = this.username;

    if (senderName != receiverName) {
      this.db.object(`userChallenges/${senderName}/outgoing/${receiverName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //update outgoing for sender
      this.db.object(`userChallenges/${receiverName}/incoming/${senderName}`).update({ "accepted": false, "challenge": this.selectedChallenge }); //Update incoming for receiver
      this.showDialog();
    } else {
      console.log("Unsupported action");
    }
  }

}
