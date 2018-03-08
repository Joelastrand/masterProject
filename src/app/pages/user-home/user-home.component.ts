import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../auth.service';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';



@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
  providers: [AuthService, AngularFireDatabase]
})
export class UserHomeComponent implements OnInit {

  user: string;
  userID: string;
  userName: string;



  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.userService.cast.subscribe(user => this.user = user);
    this.userID = this.authService.getUserID();
    this.userName = this.authService.getUserName();

  }
}
