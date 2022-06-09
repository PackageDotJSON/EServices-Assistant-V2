import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReportsService } from '../services/reports.service';
import * as CanvasJS from './canvasjs.min';

@Component({
  selector: 'app-ctc-comparison-report',
  templateUrl: './ctc-comparison-report.component.html',
  styleUrls: ['./ctc-comparison-report.component.css']
})
export class CTCComparisonReportComponent implements OnInit, OnDestroy {

  subsriber: Subscription;
  digitalCtcReport: string[];
  bankPortalData: string[];
  digitalAmount = 0;
  sumOfDigitalAmounts: number[] = [];

  constructor(private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.getCtcReport();
    this.drawChart();
  }

  getCtcReport() {
    this.subsriber = this.reportsService.fetchCombinedCtcReport().pipe(tap(res => {
      this.digitalCtcReport = res[0];
      this.bankPortalData = res[1];
    })).subscribe();
  }

  drawChart()
  {
    let chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      data: [{
        type: "pie",
        indexLabel: "{label} - {y}",
        dataPoints: [
          { y: this.digitalCtcReport, label: this.digitalCtcReport },
          { y: this.bankPortalData, label: this.bankPortalData },
        ]
      }]
    });

    chart.render();
  }

  ngOnDestroy() {
    this.subsriber.unsubscribe();
  }
}
