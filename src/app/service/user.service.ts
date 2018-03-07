import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class UserService {
  private userEmail = new BehaviorSubject<string>('');
  cast = this.userEmail.asObservable();

  constructor() { }

  editUser(newUserEmail) {
    this.userEmail.next(newUserEmail);
  }


}
