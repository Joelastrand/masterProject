import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gameinformation',
  templateUrl: './gameinformation.component.html',
  styleUrls: ['./gameinformation.component.scss']
})
export class GameInformationComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Make so the page starts on top. 
    window.scrollTo(0, 0);
  }

  goToCreateAccount() {
    this.router.navigateByUrl('/signup');
  }

  goToLogIn() {
    this.router.navigateByUrl('/login');
  }

}
