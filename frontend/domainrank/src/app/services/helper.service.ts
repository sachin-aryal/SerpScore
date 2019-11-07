import { Injectable } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private notifier: NotifierService;

  constructor(notifier: NotifierService) {
    this.notifier = notifier;
  }

  plotSplineChart(xAxisType, title, yAxisTitle, seriesName, data) {
    return new Chart({
      chart: {
        type: 'spline'
      },
      title: {
        text: title
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: xAxisType,
        dateTimeLabelFormats: {
          month: '%e. %b',
          year: '%b'
        },
        title: {
          text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: yAxisTitle
        },
        allowDecimals: false,
        min: 0
      },
      tooltip: {
        headerFormat: '<b>{series.name}: {point.x:%e %b}</b><br>',
        pointFormat: 'Rank: {point.y}'
      },

      plotOptions: {
        series: {
          marker: {
            enabled: true
          }
        }
      },
      colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
      series: [{
        type: 'spline',
        name: seriesName,
        data
      }]
    });

  }

  plotColumnChart(title, yAxisTitle, data) {
    return new Chart({
      chart: {
        type: 'column'
      },
      title: {
        text: title
      },
      credits: {
        enabled: false
      },
      xAxis: {
        labels: {
          enabled: false
        }
      },
      tooltip: {
        formatter() {
          return 'Rank: <b>' + this.y + '</b><br>Keyword: <b>' + this.series.name + '</b>';
        }
      },
      yAxis: {
        title: {
          text: yAxisTitle
        },
        allowDecimals: false,
        min: 0
      },

      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: data
    });

  }

  public showSpecificNotification( type: string, message: string, id: string ): void {
    this.notifier.show( {
      id,
      message,
      type
    } );
  }

  exportDomainReport(domainId, apiService) {
    apiService.downloadFile({domain_id: domainId}, 'DOWNLOAD_DOMAIN_REPORT').
    subscribe((data) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = domainId + '_report.csv';
      link.click();
    },
    error => {
          this.showSpecificNotification('error', error, '');
    });
  }

}
