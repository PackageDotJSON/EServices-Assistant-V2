import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import {map} from "rxjs/operators";
import { UserAccess } from "../../../services/login-service/login.service";
import * as CanvasJS from './canvasjs.min';
import * as bootstrap from "bootstrap";
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { CHANGE_COMPANY_SECTOR_API } from '../../../enums/apis.enum';
declare var $: any;

@Component({
  selector: 'app-ctc-filing-status-report',
  templateUrl: './ctc-filing-status-report.component.html',
  styleUrls: ['./ctc-filing-status-report.component.css']
})
export class CTCFilingStatusReportComponent implements OnInit {

  ctcTableList: any [] = [];
  ctcTableSummary: any[] = [];
  searchDataKey: string;
  dataNotAvailable: boolean = false;
  serverError: boolean = false;
  noTokenError: boolean = false;
  authFailedError: boolean = false;
  closed: number;
  submitted: number;
  underSubmission: number;

  constructor(private http: HttpClient, private useraccess: UserAccess, private router: Router) { }

  ngOnInit()
  {
    this.fetchCTCReportSummary();
    this.fetchCTCReport();
  }

  fetchCTCReportSummary()
  {
    this.http.get(BASE_URL + CHANGE_COMPANY_SECTOR_API.FETCH_CTC_REPORT_SUMMARY)
    .pipe(map(responseData => {
      if(JSON.stringify(responseData).includes('No Token Provided'))
      {
        this.noTokenError = true;
      }

      else if(JSON.stringify(responseData).includes('Authorization Failed. Token Expired. Please Login Again.'))
      {
        this.authFailedError = true;
        setTimeout(() => {
          this.useraccess.accessTypeFull = false;
          this.useraccess.accessTypePartial = false;
          this.useraccess.accessTypeMinimum = false;
          window.sessionStorage.clear();
          this.router.navigateByUrl('/');
          location.reload()
        }, 2000);
      }

      else
      {
        return responseData;
      }
    }))
    .subscribe(response => {
      if(this.noTokenError == false && this.authFailedError == false)
      {
        this.ctcTableSummary.push(response);
        this.ctcTableSummary = this.ctcTableSummary[0];

        this.closed = this.ctcTableSummary[0].TOTAL;
        this.submitted = this.ctcTableSummary[1].TOTAL;
        this.underSubmission = this.ctcTableSummary[2].TOTAL;

        this.drawChart();
      }
    }
    , error =>{
      this.serverError = true;
      this.showServerAlert();
    })
  }

  fetchCTCReport()
  {
    this.ctcTableList = [];
    this.http.get(BASE_URL + CHANGE_COMPANY_SECTOR_API.FETCH_CTC_TABLES)
    .pipe(map(responseData => {
      if(JSON.stringify(responseData).includes('No Token Provided'))
      {
        this.noTokenError = true;
      }

      else if(JSON.stringify(responseData).includes('Authorization Failed. Token Expired. Please Login Again.'))
      {
        this.authFailedError = true;
        setTimeout(() => {
          this.useraccess.accessTypeFull = false;
          this.useraccess.accessTypePartial = false;
          this.useraccess.accessTypeMinimum = false;
          window.sessionStorage.clear();
          this.router.navigateByUrl('/');
          location.reload()
        }, 2000);
      }

      else
      {
        return responseData;
      }
    }))
    .subscribe(response => {
      if(this.noTokenError == false && this.authFailedError == false)
      {
        this.ctcTableList.push(response);
        this.ctcTableList = this.ctcTableList[0];
      }
    }
    , error => {
      this.serverError = true;
      this.showServerAlert();
    })
  }

  searchCTCReport()
  {
    this.dataNotAvailable = false;
    this.ctcTableList = [];
    const params = new HttpParams().set('id', this.searchDataKey);
    this.http.get(BASE_URL + CHANGE_COMPANY_SECTOR_API.SEARCH_CTC_REPORT, {params})
    .pipe(map(responseData =>{
      if(JSON.stringify(responseData).includes('No Token Provided'))
      {
        this.noTokenError = true;
      }

      else if(JSON.stringify(responseData).includes('Authorization Failed. Token Expired. Please Login Again.'))
      {
        this.authFailedError = true;
        setTimeout(() => {
          this.useraccess.accessTypeFull = false;
          this.useraccess.accessTypePartial = false;
          this.useraccess.accessTypeMinimum = false;
          window.sessionStorage.clear();
          this.router.navigateByUrl('/');
          location.reload();
        }, 2000);
      }

      else
      {
        return responseData;
      }
    }))
    .subscribe(response => {

        if(this.noTokenError == false && this.authFailedError == false)
        {
          this.ctcTableList.push(response);
          this.ctcTableList = this.ctcTableList[0];
          if(this.ctcTableList.length == 0)
          {
            this.dataNotAvailable = true;
          }
        }
    }
    ,error => {
      this.serverError = true;
      this.showServerAlert();
    })
  }

  drawChart()
  {
    let chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      data: [{
        type: "pie",
        indexLabel: "{label} - {y}",
        dataPoints: [
          { y: this.ctcTableSummary[0].TOTAL, label: this.ctcTableSummary[0].STATUS },
          { y: this.ctcTableSummary[1].TOTAL, label: this.ctcTableSummary[1].STATUS},
          { y: this.ctcTableSummary[2].TOTAL, label: this.ctcTableSummary[2].STATUS}
        ]
      }]
    });

    chart.render();
  }

  hideServerAlert()
  {
    $('#serverAlert').hide();
  }

  showServerAlert()
  {
    $('#serverAlert').show();
  }

}