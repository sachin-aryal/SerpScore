import { Component } from '@angular/core';
import { AuthService, } from './services/auth.service';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import {Observable} from "rxjs/index";
import {HelperService} from "./services/helper.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'domainrank';

  isLoggedIn$: Observable<boolean>;
  domains: [];

  constructor (private authService:AuthService,
               private router:Router,
               private apiService: ApiService,
                private helperService: HelperService) {
  }

  ngOnInit() {
    this.isLoggedIn$ = this.authService.isLoggedIn;
    this.apiService.post({"limit": 2}, "LIST_CONFIG").
    subscribe(response => {
      if(response.success == true){
        this.domains = JSON.parse(response.data);
      }
    },
    error => {
          this.helperService.showSpecificNotification("error", error, '')
    })
  }

  exportReport(domain_id){

    this.apiService.downloadFile({"domain_id": domain_id}, "DOWNLOAD_DOMAIN_REPORT").
    subscribe((data) => {
      let downloadURL = window.URL.createObjectURL(data);
      let link = document.createElement('a');
      link.href = downloadURL;
      link.download = domain_id+"_report.csv";
      link.click();
    },
    error => {
          this.helperService.showSpecificNotification("error", error, '')
    });
  }

  deleteDomain(item){

  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

}
