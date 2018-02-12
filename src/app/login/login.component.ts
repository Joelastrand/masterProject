import { Component, OnInit } from '@angular/core';
import {AccordionModule} from 'primeng/accordion';     //accordion and accordion tab
import {MenuItem} from 'primeng/api';    
import {InputTextModule} from 'primeng/inputtext';            

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss'
  ]
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
