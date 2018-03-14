import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  images: any[];

  constructor(private router: Router, ) { }

  ngOnInit() {
    this.images = [];
    this.images.push({ source: 'assets/showcase/images/startpage/challenges.jpg', alt: 'Challenge you friend or enemy and kick some ass', title: 'Challenge friends' });
    this.images.push({ source: 'assets/showcase/images/startpage/getStarted.jpg', alt: 'Feeling tired on work? Do something about it!! ', title: 'Get started' });
    this.images.push({ source: 'assets/showcase/images/startpage/together.jpg', alt: 'Worked together to reach amazing results', title: 'Together we are strong' });
    this.images.push({ source: 'assets/showcase/images/startpage/victory.jpg', alt: 'Do you feel that? It is the tast of sweet victory.', title: 'Conquer your office now' });

  }

  isLoggedOut() {
    var printUsername = localStorage.getItem("localuserName");
    if (printUsername == null) {
      return true;
    }
    else
      return false;
  }

}
