import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from "../../auth.service";
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-setusername',
	templateUrl: './setusername.component.html',
	styleUrls: ['./setusername.component.scss'],
	providers: [AuthService, AngularFireDatabase]
})
export class SetusernameComponent implements OnInit {

	constructor(private toastr: ToastrService, private router: Router, public auth: AuthService, private db: AngularFireDatabase) { }
	usernameCandidate: string;
	user = {} as User;
	usernameAvailable: boolean = false;
	noSpacesInUsername: boolean = false;
	result: any;
	inputField = document.getElementById("username_field");

	ngOnInit() {

	}

	goToHome() {
		this.router.navigateByUrl('/home');
	}

	checkNoSpacesInUsername(username) {
		var passwordFormat = /^\S*$/;

		if (!(passwordFormat.test(username))) {
			this.noSpacesInUsername = true;
		}
		else {
			this.noSpacesInUsername = false;
		}
	}

	async checkUsername() {
		this.checkNoSpacesInUsername(this.user.username);
		this.user.username = this.user.username.toLowerCase();
		const res = await this.auth.checkUsername(this.user.username).subscribe(username => {
			this.usernameAvailable = !username.$value
		});
	}

	updateUsername() {
		this.auth.updateUsername(this.user.username);
		this.db.object(`scores/` + this.user.username + `/dailyChallenge/`).update({ "streak": 0 });
		this.db.object(`scores/` + this.user.username + `/points/`).update({ "score": 0 });
		this.db.object(`scores/` + this.user.username + `/points/`).update({ "totalScore": 0 });
		this.db.object(`scores/` + this.user.username + `/challengeFriend/`).update({ "start": 0 });
		this.db.object(`scores/` + this.user.username + `/challengeWithFriend/`).update({ "start": 0 });


		localStorage.setItem("localuserName", this.user.username);
		this.goToHome();
		this.toastr.info('Welcome ' + this.user.username + '!! Officise is an application that improves ' +
			' your health by getting you more physically active at the office. Try our games now with friends and have fun!'
			, 'Officise');
	}

}
