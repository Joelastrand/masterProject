import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit { 


  constructor(private router: Router,) { }

  ngOnInit() {
    window.scrollTo(0,0);
  }

  goToHealthInformation() {
    this.router.navigateByUrl('/health');    
  }

  goToGameInformation() {
    this.router.navigateByUrl('/gameInformation');    
  }

  goDown() {
    window.scrollTo(0, 1000);
  }
}
