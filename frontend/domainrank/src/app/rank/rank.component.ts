import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../services/api.service";
import {first} from "rxjs/internal/operators";
import { faArrowUp, faArrowDown, faSearch, faChartLine } from '@fortawesome/free-solid-svg-icons';
import {HelperService} from "../services/helper.service";

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.css']
})
export class RankComponent implements OnInit {

  error: string;
  data: [];
  drilledData = [];
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faSearch = faSearch;
  faChartLine = faChartLine;
  isChart: boolean;
  isSearch: boolean;
  chart = undefined;

  constructor(private route: ActivatedRoute,
              private apiService: ApiService, private helperService: HelperService) { }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadRecords(id);
  }

  loadRecords(id) {
    const params = {"domain_id": id};
    this.apiService.post(params, "GET_RANK").pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if(success == true){
            const receivedData = JSON.parse(data.data);
            this.data = receivedData;
          }else{
            this.helperService.showSpecificNotification("error", data.message, data.message)
          }
        },
        error => {
          this.helperService.showSpecificNotification("error", error, error)
        });
  }

  getUrl(url){
    if(url){
      var pattern = /^((http|https|ftp):\/\/)/;
      if(!pattern.test(url)) {
        url = "https://" + url;
      }
    }
    return url;
  }

  search_data(config_id){
    this.apiService.post({"config_id": config_id}, "RANK_DATA").pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if(success == true){
            const receivedData = JSON.parse(data.data);
            this.isSearch = true;
            this.isChart = false;
            this.drilledData = receivedData;
          }else{
            this.helperService.showSpecificNotification("error", data.message, data.message)
          }
        },
        error => {
          this.helperService.showSpecificNotification("error", error, error)
        });
  }

  plotChart(config_id){
    this.apiService.post({"config_id": config_id}, "RANK_DATA").pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if(success == true){
            const receivedData = JSON.parse(data.data);
            this.drilledData = receivedData;
            if(this.drilledData.length > 0){
              let domain = this.drilledData[0].Domain;
              let key_word = this.drilledData[0].Keyword;
              this.isSearch = false;
              this.isChart = true;
              let data = this.getProcessedData(this.drilledData);
              this.chart = this.helperService.plotSplineChart("spline", 'datetime', domain +" - "+ key_word, "Google Ranking",
                key_word, data)
            }
          }else{
            this.helperService.showSpecificNotification("error", data.message, data.message)
          }
        },
        error => {
          this.helperService.showSpecificNotification("error", error, error)
        });
  }

  getProcessedData(records){
    let final_data = [];
    records.forEach(record => {
      let row = [Date.parse(record["Date Added"]), record["Page Rank"]];
      final_data.push(row)
    });
    return final_data;
  }
}
