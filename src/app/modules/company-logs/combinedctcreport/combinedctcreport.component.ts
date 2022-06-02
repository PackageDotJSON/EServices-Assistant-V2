import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CompanyLogsService } from '../services/company-logs.service';

@Component({
  selector: 'app-combinedctcreport',
  templateUrl: './combinedctcreport.component.html',
  styleUrls: ['./combinedctcreport.component.css']
})
export class CombinedctcreportComponent implements OnInit, OnDestroy {

  subsriber: Subscription;
  digitalCtcReport: string[];
  bankPortalData: string[];
  digitalAmount = 0;
  sumOfDigitalAmounts: number[] = [];

  constructor(private companyLogsService: CompanyLogsService) { }

  ngOnInit(): void {
    this.getCtcReport();
  }

  getCtcReport() {
    this.subsriber = this.companyLogsService.fetchCombinedCtcReport().pipe(tap(res => {
      this.digitalCtcReport = res[0];
      this.bankPortalData = res[1];
    })).subscribe();
  }

  ngOnDestroy() {
    this.subsriber.unsubscribe();
  }
}
