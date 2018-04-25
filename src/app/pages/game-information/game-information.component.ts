import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-information',
  templateUrl: './game-information.component.html',
  styleUrls: ['./game-information.component.scss']
})
export class GameInformationComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToCreateAccount() {
    this.router.navigateByUrl('/signup');
  }

}
