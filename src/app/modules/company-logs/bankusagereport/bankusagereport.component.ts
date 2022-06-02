import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { CHANGE_COMPANY_OBJECT_API } from 'src/app/enums/apis.enum';
import { CompanyLogsService } from '../services/company-logs.service';
import * as bootstrap from "bootstrap";
declare var $: any;

@Component({
  selector: 'app-bankusagereport',
  templateUrl: './bankusagereport.component.html',
  styleUrls: ['./bankusagereport.component.css']
})
export class BankusagereportComponent implements OnInit {

  bankUsageReport$: Observable<any>;
  bankUsageReport: string[];
  startDateKey = '';
  endDateKey = '';
  writeToExcelAlert = false;

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
    this.bankUsageReport$.subscribe(res => this.bankUsageReport = res)
    
  }

  exportData()
  {
    this.http.post(BASE_URL + CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL, {value: this.bankUsageReport, fileName: 'BankReport'})
    .subscribe(responseData => {
        if(JSON.stringify(responseData).includes("Written to Excel Successfully"))
        {
          this.writeToExcelAlert = true;
          this.showExcelAlert();
        }
    })
  }

  hideExcelAlert()
  {
    $('#excelAlert').hide();
  }

  showExcelAlert()
  {
    $('#excelAlert').show()
  }

}
