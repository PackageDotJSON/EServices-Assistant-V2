import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReportsService } from '../services/reports.service';
import * as CanvasJS from './canvasjs.min';

@Component({
  selector: 'app-ctc-comparison-report',
  templateUrl: './ctc-comparison-report.component.html',
  styleUrls: ['./ctc-comparison-report.component.css'],
})
export class CTCComparisonReportComponent implements OnInit, OnDestroy {
  subsriber: Subscription;
  digitalCtcReport = [];
  bankPortalData = [];
  digitalAmount = 0;
  sumOfDigitalAmounts: number[] = [];
  startDateKey: string;
  endDateKey: string;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.getCtcReport();
  }

  getCtcReport() {
    this.subsriber = this.reportsService
      .fetchCombinedCtcReport()
      .pipe(
        tap((res) => {
          this.calculateDigitalCtcReport(res[0]);
          this.calculateBankPortalData(res[1]);
          this.drawChart();
        })
      )
      .subscribe();
  }

  calculateDigitalCtcReport(ctcReport) {
    let standardAmountTotal = 0;
    let standardIssuedTotal = 0;
    let digitalAmountTotal = 0;
    let digitalIssuedTotal = 0;

    for (let i = 0; i < ctcReport.length; i++) {
      if (i + 1 === ctcReport.length) {
        standardAmountTotal = standardAmountTotal + ctcReport[i]['STAND_AMT'];
        standardIssuedTotal =
          standardIssuedTotal + ctcReport[i]['STAND_ISSUED'];
        digitalAmountTotal = digitalAmountTotal + ctcReport[i]['DIG_AMT'];
        digitalIssuedTotal = digitalIssuedTotal + ctcReport[i]['DIG_ISSUED'];

        this.digitalCtcReport.push({
          INVOICE_MONTH: ctcReport[i]['INVOICE_MONTH'],
          DIG_AMT: digitalAmountTotal,
          DIG_ISSUED: digitalIssuedTotal,
          STAND_AMT: standardAmountTotal,
          STAND_ISSUED: standardIssuedTotal,
        });

        break;
      }
      if (ctcReport[i]['INVOICE_MONTH'] === ctcReport[i + 1]['INVOICE_MONTH']) {
        standardAmountTotal = standardAmountTotal + ctcReport[i]['STAND_AMT'];
        standardIssuedTotal =
          standardIssuedTotal + ctcReport[i]['STAND_ISSUED'];
        digitalAmountTotal = digitalAmountTotal + ctcReport[i]['DIG_AMT'];
        digitalIssuedTotal = digitalIssuedTotal + ctcReport[i]['DIG_ISSUED'];
      } else {
        standardAmountTotal = standardAmountTotal + ctcReport[i]['STAND_AMT'];
        standardIssuedTotal =
          standardIssuedTotal + ctcReport[i]['STAND_ISSUED'];
        digitalAmountTotal = digitalAmountTotal + ctcReport[i]['DIG_AMT'];
        digitalIssuedTotal = digitalIssuedTotal + ctcReport[i]['DIG_ISSUED'];

        this.digitalCtcReport.push({
          INVOICE_MONTH: ctcReport[i]['INVOICE_MONTH'],
          DIG_AMT: digitalAmountTotal,
          DIG_ISSUED: digitalIssuedTotal,
          STAND_AMT: standardAmountTotal,
          STAND_ISSUED: standardIssuedTotal,
        });
      }
    }
  }

  calculateBankPortalData(bankData) {
    let invoiceTotal = 0;

    for (let i = 0; i < bankData.length; i++) {
      if (i + 1 === bankData.length) {
        invoiceTotal = invoiceTotal + bankData[i]['INVOICE_AMOUNT'];
        this.bankPortalData.push({
          month: bankData[i]['INVOICE_MONTH'],
          value: invoiceTotal,
        });
        break;
      }
      if (bankData[i]['INVOICE_MONTH'] === bankData[i + 1]['INVOICE_MONTH']) {
        invoiceTotal = invoiceTotal + bankData[i]['INVOICE_AMOUNT'];
      } else {
        invoiceTotal = invoiceTotal + bankData[i]['INVOICE_AMOUNT'];
        this.bankPortalData.push({
          month: bankData[i]['INVOICE_MONTH'],
          value: invoiceTotal,
        });
        invoiceTotal = 0;
      }
    }
  }

  drawChart() {
    let chart = new CanvasJS.Chart('chartContainer', {
      animationEnabled: true,
      exportEnabled: true,
      data: [
        {
          type: 'pie',
          indexLabel: '{label} - {y}',
          dataPoints: [
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 1]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 1]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 2]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 2]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 3]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 3]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 4]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 4]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 5]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 5]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 6]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 6]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 7]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 7]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 8]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 8]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 9]
                .DIG_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 9]
                  .INVOICE_MONTH,
            },
          ],
        },
      ],
    });

    let chart2 = new CanvasJS.Chart('chartContainer2', {
      animationEnabled: true,
      exportEnabled: true,
      data: [
        {
          type: 'pie',
          indexLabel: '{label} - {y}',
          dataPoints: [
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 1]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 1]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 2]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 2]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 3]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 3]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 4]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 4]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 5]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 5]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 6]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 6]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 7]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 7]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 8]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 8]
                  .INVOICE_MONTH,
            },
            {
              y: this.digitalCtcReport[this.digitalCtcReport.length - 9]
                .STAND_AMT,
              label:
                this.digitalCtcReport[this.digitalCtcReport.length - 9]
                  .INVOICE_MONTH,
            },
          ],
        },
      ],
    });

    let chart3 = new CanvasJS.Chart('chartContainer3', {
      animationEnabled: true,
      exportEnabled: true,
      data: [
        {
          type: 'pie',
          indexLabel: '{label} - {y}',
          dataPoints: [
            {
              y: this.bankPortalData[this.bankPortalData.length - 1].value,
              label: this.bankPortalData[this.bankPortalData.length - 1].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 2].value,
              label: this.bankPortalData[this.bankPortalData.length - 2].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 3].value,
              label: this.bankPortalData[this.bankPortalData.length - 3].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 4].value,
              label: this.bankPortalData[this.bankPortalData.length - 4].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 5].value,
              label: this.bankPortalData[this.bankPortalData.length - 5].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 6].value,
              label: this.bankPortalData[this.bankPortalData.length - 6].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 7].value,
              label: this.bankPortalData[this.bankPortalData.length - 7].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 8].value,
              label: this.bankPortalData[this.bankPortalData.length - 8].month,
            },
            {
              y: this.bankPortalData[this.bankPortalData.length - 9].value,
              label: this.bankPortalData[this.bankPortalData.length - 9].month,
            },
          ],
        },
      ],
    });

    chart.render();
    chart2.render();
    chart3.render();
  }

  filterCtcComparisonReport() {}

  ngOnDestroy() {
    this.subsriber.unsubscribe();
  }
}
