import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "src/app/constants/base-url.constant";
import { BANK_USAGE_REPORT_API, COMBINED_CTC_REPORT_API } from "src/app/enums/apis.enum";

@Injectable()

export class ReportsService {
    constructor(private http: HttpClient){}

    fetchCombinedCtcReport(): Observable<any> {
        return this.http.get(BASE_URL + COMBINED_CTC_REPORT_API.FETCH_CTC_REPORT);
    }

    fetchBankUsageReport(payload): Observable<any> {
        return this.http.post(BASE_URL + BANK_USAGE_REPORT_API.FETCH_BANK_USAGE_REPORT, payload);
    }
}