import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from "../auth.service";
import { User } from "../models/user";
import { AngularFireDatabase } from 'angularfire2/database-deprecated';

@Component({
	selector: 'app-setusername',
	templateUrl: './setusername.component.html',
	styleUrls: ['./setusername.component.scss'],
	providers: [AuthService, AngularFireDatabase]
})
export class SetusernameComponent implements OnInit {

	constructor(private router: Router, public auth: AuthService) { }
	usernameCandidate: string;
	user = {} as User;
	usernameAvailable: boolean = false;
	result: any;

	ngOnInit() {
	}

	goToHome() {
		this.router.navigateByUrl('/home');
	}

	async checkUsername() {
		const res = await this.auth.checkUsername(this.user.username).subscribe(username => {
			this.usernameAvailable = !username.$value
		});
	}

	updateUsername() {
		this.auth.updateUsername(this.user.username);
		this.goToHome();
	}

}
