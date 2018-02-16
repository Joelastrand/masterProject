import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from "../models/user";
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {GrowlModule,Message} from 'primeng/primeng';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [ConfirmationService]
})
export class SignupComponent implements OnInit {
  user = {} as User;
  errorMessage = "";
  //msgs = this.errorMessage;
  msgs: Message[] = [];
  constructor(private afAuth: AngularFireAuth, private confirmationService: ConfirmationService) { }

  ngOnInit() {
  }

  confirm1() {
    this.confirmationService.confirm({
        message: this.errorMessage,
        header: 'Confirmation',
        //icon: 'fa fa-question-circle',
        accept: () => {
            //this.msgs = [{severity:'info', summary:'Confirmed', detail:'You have accepted'}];
        }
    });
}

  async register(user: User) {
    try{
      const result = await this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
      console.log("hejconfirm");
      this.confirm1();
      console.log("hejconfirmasda");
      //document.getElementById("errorMsg").style.color="green";
      this.errorMessage = "Successfully created account with email " + result.email;
    } catch (e){
      if(e.message.indexOf(':') > -1) {
        document.getElementById("errorMsg").style.color="red";
        this.errorMessage = e.message.split(":",2)[1];
        //console.error(e.message.split(":",2)[1]);
      } else {
        //console.error(e);
        document.getElementById("errorMsg").style.color="red";
        this.errorMessage = e.message;
      }
      
      
      
    }
    
  }

}
