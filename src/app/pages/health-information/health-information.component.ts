import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-health-information',
  templateUrl: './health-information.component.html',
  styleUrls: ['./health-information.component.scss']
})
export class HealthInformationComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToCreateAccount() {
    this.router.navigateByUrl('/signup');
  }

}
