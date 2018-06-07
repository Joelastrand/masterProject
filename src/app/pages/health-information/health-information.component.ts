import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-health-information',
  templateUrl: './health-information.component.html',
  styleUrls: ['./health-information.component.scss']
})
export class HealthInformationComponent implements OnInit {

  printUsername=null;

  
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

  
  isLoggedOut() {
    this.printUsername = localStorage.getItem("localuserName");
    if (this.printUsername == null) {
      return true;
    }
    else
    return false;
  }

}
