import { Routes } from '@angular/router';

import { AppliedCTCReportComponent } from '../applied-ctc-report/applied-ctc-report.component';
import { BankTransactionLogComponent } from '../bank-transaction-log/bank-transaction-log.component';
import { BankusagereportComponent } from '../bank-usage-report/bank-usage-report.component';
import { CTCComparisonReportComponent } from '../ctc-comparison-report/ctc-comparison-report.component';
import { CTCFilingStatusReportComponent } from '../ctc-filing-status-report/ctc-filing-status-report.component';
import { ProcessReportStatusWiseComponent } from '../process-report-status-wise/process-report-status-wise.component';
import { ViewCompanyRecordsComponent } from '../view-company-records/view-company-records.component';
import { ViewCompanySubmissionModeComponent } from '../view-company-submission-mode/view-company-submission-mode.component';
import { DataSharingMonitoringReportComponent } from '../data-sharing-monitoring-report/data-sharing-monitoring-report.component';

export const ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'appliedctcreport', component: AppliedCTCReportComponent },
      {
        path: 'searchbanktransactionlog',
        component: BankTransactionLogComponent,
      },
      {
        path: 'bankusagereport',
        component: BankusagereportComponent,
      },
      {
        path: 'ctcrevenuereport',
        component: CTCComparisonReportComponent,
      },
      {
        path: 'ctcfilingstatusreport',
        component: CTCFilingStatusReportComponent,
      },
      {
        path: 'processreportbystatus',
        component: ProcessReportStatusWiseComponent,
      },
      {
        path: 'viewcompanyrecords',
        component: ViewCompanyRecordsComponent,
      },
      {
        path: 'viewcompanysubmissionmode',
        component: ViewCompanySubmissionModeComponent,
      },
      {
        path: 'datasharingmonitoringreport',
        component: DataSharingMonitoringReportComponent,
      },
    ],
  },
];
