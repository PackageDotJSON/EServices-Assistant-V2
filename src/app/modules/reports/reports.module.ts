import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ROUTES } from './routes/routes.constant';

import { AppliedCTCReportComponent } from './applied-ctc-report/applied-ctc-report.component';
import { BankTransactionLogComponent } from './bank-transaction-log/bank-transaction-log.component';
import { BankusagereportComponent } from './bank-usage-report/bank-usage-report.component';
import { CTCComparisonReportComponent } from './ctc-comparison-report/ctc-comparison-report.component';
import { CTCFilingStatusReportComponent } from './ctc-filing-status-report/ctc-filing-status-report.component';
import { ProcessReportStatusWiseComponent } from './process-report-status-wise/process-report-status-wise.component';
import { ViewCompanyRecordsComponent } from './view-company-records/view-company-records.component';
import { ViewCompanySubmissionModeComponent } from 'src/app/modules/reports/view-company-submission-mode/view-company-submission-mode.component';

import { ReportsService } from './services/reports.service';


@NgModule({
  declarations: [
    AppliedCTCReportComponent,
    BankTransactionLogComponent,
    BankusagereportComponent,
    CTCComparisonReportComponent,
    CTCFilingStatusReportComponent,
    ProcessReportStatusWiseComponent,
    ViewCompanyRecordsComponent,
    ViewCompanySubmissionModeComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(ROUTES)],
  providers: [ReportsService],
})
export class ReportsModule {}
