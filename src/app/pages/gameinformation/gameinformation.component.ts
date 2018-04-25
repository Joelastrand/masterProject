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
  }

  goToCreateAccount() {
    this.router.navigateByUrl('/signup');
  }

}
