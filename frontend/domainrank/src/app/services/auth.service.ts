import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from "@angular/router";
import {map} from "rxjs/internal/operators";
import {ApiService} from "./api.service";

export interface ApplicationUser {
  token: string;
  username: string;
  expiry_date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<ApplicationUser>;
  public currentUser: Observable<ApplicationUser>;
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private router: Router, private api: ApiService) {
    this.currentUserSubject = new BehaviorSubject<ApplicationUser>(JSON.parse(localStorage.getItem('currentUser')));
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.loggedIn.next(false);
    if(user && user.token){
      this.loggedIn.next(true);
    }
  }

  public get currentUserValue(): ApplicationUser {
    return this.currentUserSubject.value;
  }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  login(username: string, password: string){
    return this.api.post({"username": username, "password": password}, "GET_TOKEN")
      .pipe(map(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.loggedIn.next(true);
          return user;
        }
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

}
