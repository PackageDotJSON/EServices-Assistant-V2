import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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
  isWaiting = false;

  constructor(
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    this.getBankUsageReport();
  }

  getBankUsageReport() {
    this.isWaiting = true;
    const payload = {
      startDate: this.startDateKey,
      endDate: this.endDateKey,
    };
    this.bankUsageReport$ = this.reportsService.fetchBankUsageReport(payload);
    this.subscriber.push(
      this.bankUsageReport$
        .pipe(tap((res) => (this.bankUsageReport = res, this.isWaiting = false)))
        .subscribe()
    );
  }

  exportData() {
    this.subscriber.push(
      this.reportsService
        .exportData(
          this.bankUsageReport,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          'BankReport'
        )
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
    this.subscriber.push(
      this.reportsService
        .downloadExcelFile(
          BANK_USAGE_REPORT_FILE,
          CHANGE_COMPANY_OBJECT_API.DOWNLOAD_EXCEL_FILE
        )
        .pipe(
          tap((res) => {
            this.reportsService.downloadFileToDesktop(res, 'text/csv');
          })
        )
        .subscribe()
    );
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
