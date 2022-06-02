import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { CHANGE_COMPANY_OBJECT_API } from 'src/app/enums/apis.enum';
import { CompanyLogsService } from '../services/company-logs.service';
import * as bootstrap from "bootstrap";
import { tap } from 'rxjs/operators';
import { END_KEY, START_KEY } from 'src/app/settings/app.settings';
declare var $: any;

@Component({
  selector: 'app-bankusagereport',
  templateUrl: './bankusagereport.component.html',
  styleUrls: ['./bankusagereport.component.css']
})
export class BankusagereportComponent implements OnInit, OnDestroy {

  bankUsageReport$: Observable<any>;
  bankUsageReport: string[];
  startDateKey = START_KEY;
  endDateKey = END_KEY;
  writeToExcelAlert = false;
  subscriber: Subscription[] = [];

  constructor(private companyLogsService: CompanyLogsService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getBankUsageReport();
  }

  getBankUsageReport() {
    const payload = {
      startDate: this.startDateKey,
      endDate: this.endDateKey
    };
    this.bankUsageReport$ = this.companyLogsService.fetchBankUsageReport(payload);
    this.subscriber.push(this.bankUsageReport$.pipe(tap(res => this.bankUsageReport = res)).subscribe());
  }

  exportData()
  {
    this.subscriber.push(this.http.post(BASE_URL + CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL, {value: this.bankUsageReport, fileName: 'BankReport'})
    .pipe(tap(res => {
      if(JSON.stringify(res).includes("Written to Excel Successfully"))
      {
        this.writeToExcelAlert = true;
        this.showExcelAlert();
      }
    })).subscribe());
  }

  hideExcelAlert()
  {
    $('#excelAlert').hide();
  }

  showExcelAlert()
  {
    $('#excelAlert').show()
  }

  ngOnDestroy(): void {
    this.subscriber.forEach(subscription => {
      subscription.unsubscribe();
    })
  }

}
