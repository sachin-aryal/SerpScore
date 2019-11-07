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

  plotSplineChart(type, xAxisType, title, yAxisTitle, series_name, data){
    return new Chart({
      chart: {
        type: type
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
        type: type,
        name: series_name,
        data: data
      }]
    });

  }

  public showSpecificNotification( type: string, message: string, id: string ): void {
		this.notifier.show( {
			id,
			message,
			type
		} );
	}


}
