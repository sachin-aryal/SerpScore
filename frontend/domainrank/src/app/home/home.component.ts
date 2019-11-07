import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { faPen, faTrash, faFileExport } from '@fortawesome/free-solid-svg-icons';
import {HelperService} from "../services/helper.service";

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
  constructor(private apiService: ApiService, private helperService: HelperService) {
    this.domainData = []
  }

  getAllDomains() {
    this.apiService.post({}, "LIST_CONFIG").
    subscribe(response => {
      if(response.success == true){
        this.domainData = JSON.parse(response.data);
      }
    },
    error => {
          this.helperService.showSpecificNotification("error", error, '')
    })
  }

  ngOnInit() {
    this.getAllDomains()
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

}
