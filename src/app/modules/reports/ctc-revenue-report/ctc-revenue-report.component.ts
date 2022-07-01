import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CHANGE_COMPANY_OBJECT_API } from 'src/app/enums/apis.enum';
import {
  CHART_CONFIG,
  CTC_COMPARISON_REPORT_FILE,
  END_KEY,
  START_KEY,
} from 'src/app/settings/app.settings';
import { ReportsService } from '../services/reports.service';
import * as bootstrap from 'bootstrap';
import { Chart } from 'chart.js';
declare var $: any;

@Component({
  selector: 'app-ctc-revenue-report',
  templateUrl: './ctc-revenue-report.component.html',
  styleUrls: ['./ctc-revenue-report.component.css'],
})
export class CTCRevenueReportComponent implements OnInit, OnDestroy {
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
  isWaiting = false;
  digitalSum = 0;
  standardSum = 0;
  bankPortalSum = 0;
  chartData: unknown;
  chartConfig: any;
  myChart: any;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.getCtcReport();
  }

  getCtcReport() {
    this.myChart?.destroy();
    this.isWaiting = true;
    this.digitalCtcReport = [];
    this.bankPortalData = [];
    this.subscriber.push(
      this.reportsService
        .fetchCombinedCtcReport(this.startDateKey, this.endDateKey)
        .pipe(
          tap((res) => {
            this.calculateDigitalCtcReport(res[0]);
            this.calculateBankPortalData(res[1]);
            this.setChartData();
            this.isWaiting = false;
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
          YEAR: ctcReport[i]['DATE'].split('-')[0],
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
          YEAR: ctcReport[i]['DATE'].split('-')[0],
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
          year: bankData[i]['INVOICE_PERIOD_FROM'].split('-')[0],
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
          year: bankData[i]['INVOICE_PERIOD_FROM'].split('-')[0],
        });
        invoiceTotal = 0;
      }
    }

    this.mapBankPortalData();
  }

  setChartData() {
    const labels = [];
    const digitalCtcChart = [];
    const standardCtcChart = [];

    this.digitalCtcReport.forEach((item) => {
      if (item !== null && item !== undefined) {
        labels.push(item?.INVOICE_MONTH + ' ' + item?.YEAR);
        digitalCtcChart.push(item?.DIG_AMT);
        standardCtcChart.push(item?.STAND_AMT);
      }
    });

    this.chartData = {
      labels: labels,
      datasets: [
        {
          type: CHART_CONFIG.BAR_CHART,
          label: 'Digital CTC Revenue',
          data: digitalCtcChart,
          backgroundColor: 'rgb(255, 99, 132)',
          hoverOffset: 4,
        },
        {
          type: CHART_CONFIG.BAR_CHART,
          label: 'Standard CTC Revenue',
          data: standardCtcChart,
          backgroundColor: 'rgb(54, 162, 235)',
          hoverOffset: 4,
        },
      ],
    };
    this.chartConfig = {
      type: CHART_CONFIG.BAR_CHART,
      data: this.chartData,
      options: {},
    };

    this.myChart = new Chart(
      document.getElementById('myChart') as HTMLCanvasElement,
      this.chartConfig
    );
  }

  exportData() {
    const comparisonReport = this.digitalCtcReport
      .concat(this.bankPortalData)
      .filter((value) => value !== null && value !== undefined);
    this.subscriber.push(
      this.reportsService
        .exportData(
          comparisonReport,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          'CtcComparisonReport'
        )
        .pipe(
          tap((res) => {
            if (JSON.stringify(res).includes('Written to Excel Successfully')) {
              this.writeToExcelAlert = true;
              this.showExcelAlert();
            }
          }),
          switchMap(() =>
            this.reportsService
              .downloadExcelFile(
                CTC_COMPARISON_REPORT_FILE,
                CHANGE_COMPANY_OBJECT_API.DOWNLOAD_EXCEL_FILE
              )
              .pipe(
                tap((res) => {
                  this.reportsService.downloadFileToDesktop(res, 'text/csv');
                })
              )
          )
        )
        .subscribe()
    );
  }

  mapBankPortalData() {
    if (
      this.bankPortalData[0].month !== this.digitalCtcReport[0].INVOICE_MONTH
    ) {
      this.digitalCtcReport.unshift(null);
    } else if (
      this.bankPortalData[this.bankPortalData.length - 1].month !==
      this.digitalCtcReport[this.digitalCtcReport.length - 1].INVOICE_MONTH
    ) {
      this.bankPortalData.push(null);
    }

    this.digitalCtcReport.forEach((item) => {
      if (item !== null && item !== undefined) {
        this.digitalSum = this.digitalSum + item?.DIG_AMT;
        this.standardSum = this.standardSum + item?.STAND_AMT;
      }
    });

    this.bankPortalData.forEach((item) => {
      if (item !== null && item !== undefined) {
        this.bankPortalSum = this.bankPortalSum + item.value;
      }
    });
  }

  hideExcelAlert() {
    $('#excelAlert').hide();
  }

  showExcelAlert() {
    $('#excelAlert').show();
  }

  ngOnDestroy() {
    this.subscriber.forEach((item) => item.unsubscribe());
  }
}
