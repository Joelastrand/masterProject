import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  
  constructor(private router: Router,) { }

  ngOnInit() {
  }

  
  goToStartPage() {
    this.router.navigateByUrl('');
  }

  goToCreateAccount() {
    this.router.navigateByUrl('/signup');
  }
  goToLogIn() {
    this.router.navigateByUrl('/login');
  }
  goToDaily() {
    this.router.navigateByUrl('/dailyChallenge');
  }
}
