import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { CHANGE_COMPANY_OBJECT_API } from 'src/app/enums/apis.enum';
import { ReportsService } from '../services/reports.service';
import * as bootstrap from 'bootstrap';
import { tap } from 'rxjs/operators';
import {
  BANK_USAGE_REPORT_FILE,
  END_KEY,
  START_KEY,
} from 'src/app/settings/app.settings';
declare var $: any;

@Component({
  selector: 'app-bank-usage-report',
  templateUrl: './bank-usage-report.component.html',
  styleUrls: ['./bank-usage-report.component.css'],
})
export class BankusagereportComponent implements OnInit, OnDestroy {
  bankUsageReport$: Observable<any>;
  bankUsageReport: string[];
  startDateKey = START_KEY;
  endDateKey = END_KEY;
  writeToExcelAlert = false;
  subscriber: Subscription[] = [];

  constructor(
    private reportsService: ReportsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.getBankUsageReport();
  }

  getBankUsageReport() {
    const payload = {
      startDate: this.startDateKey,
      endDate: this.endDateKey,
    };
    this.bankUsageReport$ = this.reportsService.fetchBankUsageReport(payload);
    this.subscriber.push(
      this.bankUsageReport$
        .pipe(tap((res) => (this.bankUsageReport = res)))
        .subscribe()
    );
  }

  exportData() {
    this.subscriber.push(
      this.http
        .post(BASE_URL + CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL, {
          value: this.bankUsageReport,
          fileName: 'BankReport',
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
    const params = new HttpParams().set('id', BANK_USAGE_REPORT_FILE);
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

  ngOnDestroy(): void {
    this.subscriber.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
