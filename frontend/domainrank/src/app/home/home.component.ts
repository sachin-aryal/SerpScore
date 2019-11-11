import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { faPen, faTrash, faFileExport } from '@fortawesome/free-solid-svg-icons';
import {HelperService} from '../services/helper.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  domainData: [];
  faPen = faPen;
  faTrash = faTrash;
  faFileExport = faFileExport;
  constructor(public apiService: ApiService, public helperService: HelperService) {
    this.domainData = [];
  }

  getAllDomains() {
    this.apiService.post({}, 'LIST_CONFIG').
    subscribe(response => {
      if (response.success === true) {
        this.domainData = JSON.parse(response.data);
      }
    },
    error => {
          this.helperService.showSpecificNotification('error', error, '');
    });
  }

  ngOnInit() {
    this.getAllDomains();
  }

}
