import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { CHANGE_COMPANY_OBJECT_API } from 'src/app/enums/apis.enum';
import { BANK_USAGE_REPORT_FILE, CTC_COMPARISON_REPORT_FILE, END_KEY, START_KEY } from 'src/app/settings/app.settings';
import { ReportsService } from '../services/reports.service';
import * as CanvasJS from './canvasjs.min';
import * as bootstrap from 'bootstrap';
declare var $: any;

@Component({
  selector: 'app-ctc-comparison-report',
  templateUrl: './ctc-comparison-report.component.html',
  styleUrls: ['./ctc-comparison-report.component.css'],
})
export class CTCComparisonReportComponent implements OnInit, OnDestroy {
  subscriber: Subscription[] = [];
  digitalCtcReport = [];
  bankPortalData = [];
  digitalAmount = 0;
  sumOfDigitalAmounts: number[] = [];
  startDateKey = START_KEY;
  endDateKey = END_KEY;
  ctcYear = [2021];
  bankYear = [2021];
  writeToExcelAlert = false;

  constructor(private reportsService: ReportsService, private http: HttpClient) {}

  ngOnInit(): void {
    this.getCtcReport();
  }

  getCtcReport() {
    this.subscriber.push(this.reportsService
      .fetchCombinedCtcReport(this.startDateKey, this.endDateKey)
      .pipe(
        tap((res) => {
          this.calculateDigitalCtcReport(res[0]);
          this.calculateBankPortalData(res[1]);
          this.drawChart();
        })
      )
      .subscribe()
      );
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
          YEAR: ctcReport[i]['DATE'].split('-')[0]
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
          YEAR: ctcReport[i]['DATE'].split('-')[0]
        });
        standardAmountTotal = 0;
        standardIssuedTotal = 0;
        digitalAmountTotal = 0;
        digitalIssuedTotal = 0;
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
          year: bankData[i]['INVOICE_PERIOD_FROM'].split('-')[0]
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
          year: bankData[i]['INVOICE_PERIOD_FROM'].split('-')[0]
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

  exportData() {
    let comparisonReport = {...this.bankPortalData, ...this.digitalCtcReport};
    this.subscriber.push(
      this.http
        .post(BASE_URL + CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL, {
          value: comparisonReport,
          fileName: 'CtcComparisonReport',
        }, {responseType: 'text'})
        .pipe(
          tap((res) => {
            if (JSON.stringify(res).includes('Written to Excel Successfully')) {
              this.writeToExcelAlert = true;
              this.showExcelAlert();
            }
          })
        )
        .subscribe()
    );
  }

  downloadExcelFile() {
    const params = new HttpParams().set('id', CTC_COMPARISON_REPORT_FILE);
    this.subscriber.push(this.http
      .get(BASE_URL + CHANGE_COMPANY_OBJECT_API.DOWNLOAD_EXCEL_FILE, {
        params: params,
        responseType: 'blob',
      })
      .pipe(
        tap((res) => {
          this.downloadFile(res, 'text/csv');
        })
      )
      .subscribe()
    );
  }

  downloadFile(data: any, type: string) {
    let blob = new Blob([data], {type: type});
    let url = window.URL.createObjectURL(blob);
    let pwa = window.open(url);

    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
      alert('Please disable your pop up blocker for better experience.');
    }
  }

  hideExcelAlert() {
    $('#excelAlert').hide();
  }

  showExcelAlert() {
    $('#excelAlert').show();
  }

  ngOnDestroy() {
    this.subscriber.forEach(item => item.unsubscribe());
  }
}
