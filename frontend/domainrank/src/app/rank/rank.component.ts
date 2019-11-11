import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../services/api.service';
import {first} from 'rxjs/internal/operators';
import {
  faArrowDown,
  faArrowUp,
  faChartLine,
  faColumns,
  faFileExport,
  faSearch,
  faList
} from '@fortawesome/free-solid-svg-icons';
import {HelperService} from '../services/helper.service';

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
  faFileExport = faFileExport;
  faColumns = faColumns;
  faList = faList;
  isChart = false;
  isSearch = false;
  rankChart = undefined;
  keywordChart = undefined;
  domainId: string;

  constructor(private route: ActivatedRoute,
              public apiService: ApiService,
              public helperService: HelperService) {
    route.params.subscribe(val => {
      const id = this.route.snapshot.params.id;
      this.domainId = id;
      this.loadRecords(id);
    });

  }

  ngOnInit() {

  }

  loadRecords(id) {
    const params = {domain_id: id};
    this.apiService.post(params, 'GET_RANK').pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if (success === true) {
            this.data = JSON.parse(data.data);
            if (this.data.length === 0) {
              this.helperService.showSpecificNotification('error', 'No Ranking Data', '');
              return;
            }
            const processedData = this.getKeywordProcessedData(this.data);
            const ranks = [];
            processedData.forEach(record => {
              const row = {};
              row['name'] = record.keyword;
              row['type'] = undefined;
              row['data'] = [record.page_rank];
              ranks.push(row);
            });
            this.keywordChart = HelperService.plotColumnChart('Keyword Rank', 'Rank', ranks);
          } else {
            this.helperService.showSpecificNotification('error', data.message, data.message);
          }
        },
        error => {
          this.helperService.showSpecificNotification('error', error, error);
        });
  }

  getUrl(url) {
    if (url) {
      const pattern = /^((http|https|ftp):\/\/)/;
      if (!pattern.test(url)) {
        url = 'https://' + url;
      }
    }
    return url;
  }

  search_data(configId) {
    this.apiService.post({config_id: configId}, 'RANK_DATA').pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if (success === true) {
            const receivedData = JSON.parse(data.data);
            this.isSearch = true;
            this.isChart = false;
            this.drilledData = receivedData;
          } else {
            this.helperService.showSpecificNotification('error', data.message, data.message);
          }
        },
        error => {
          this.helperService.showSpecificNotification('error', error, error);
        });
  }

  plotChart(configId) {
    this.apiService.post({config_id: configId}, 'RANK_DATA').pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if (success === true) {
            this.drilledData = JSON.parse(data.data);
            if (this.drilledData.length > 0) {
              const domain = this.drilledData[0].Domain;
              const keyword = this.drilledData[0].Keyword;
              this.isSearch = false;
              this.isChart = true;
              const chartData = this.getProcessedData(this.drilledData);
              this.rankChart = HelperService.plotSplineChart('datetime', domain + ' - ' + keyword, 'Google Ranking',
                keyword, chartData);
            }
          } else {
            this.helperService.showSpecificNotification('error', data.message, data.message);
          }
        },
        error => {
          this.helperService.showSpecificNotification('error', error, error);
        });
  }

  getKeywordProcessedData(records) {
    const items = records.slice(0, 10).map(i => {
      return i;
    });
    return items;
  }

  getProcessedData(records) {
    const finalData = [];
    records.forEach(record => {
      const row = [Date.parse(record['Date Added']), record['Page Rank']];
      finalData.push(row);
    });
    return finalData;
  }

  viewMainChart() {
    this.isChart = false;
    this.isSearch = false;
  }

}
