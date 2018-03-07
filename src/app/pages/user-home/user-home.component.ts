import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';


@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {

  user: string; 


  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.cast.subscribe(user => this.user = user);
  }

}
