import { environment } from 'src/environments/environment';

export const DEBOUNCE_TIME = 1000;
export const START_KEY = '2021-01-01';
export const END_KEY = '2022-06-30';
export const APPLIED_CTC_REPORT_FILE = 'AppliedCtcReport.csv';
export const CTC_FILING_STATUS_REPORT_FILE = 'CtcFilingStatusReport.csv';
export const BANK_TRANSACTION_LOG_FILE = 'BankTransactionLog.csv';
export const BANK_USAGE_REPORT_FILE = 'BankUsageReportFile.csv';
export const PROCESS_ERROR_FILE = 'ProcessErrorFile.csv';
export const CTC_COMPARISON_REPORT_FILE = 'CtcComparisonFile.csv';
export const INITIAL_LOADING_TIME = environment.loadingTime;
