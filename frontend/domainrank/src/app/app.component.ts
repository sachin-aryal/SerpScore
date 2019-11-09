import {Component, OnInit} from '@angular/core';
import { AuthService, } from './services/auth.service';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import {Observable} from 'rxjs';
import {HelperService} from './services/helper.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'domainrank';

  isLoggedIn$: Observable<boolean>;
  domains: [];

  constructor(private authService: AuthService,
              private router: Router,
              private apiService: ApiService,
              private helperService: HelperService) {
  }
  ngOnInit() {
    this.isLoggedIn$ = this.authService.isLoggedIn;
    this.isLoggedIn$.subscribe(event => {
      if (event === true) {
        this.apiService.post({limit: 2}, 'LIST_CONFIG').
        subscribe(response => {
            if (response.success === true) {
              this.domains = JSON.parse(response.data);
            }
          },
          error => {
            this.helperService.showSpecificNotification('error', error, '');
          });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

}
