import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import * as CanvasJS from './canvasjs.min';
import { UserAccess } from '../../../services/login-service/login.service';
import * as bootstrap from 'bootstrap';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { CHANGE_COMPANY_OBJECT_API } from '../../../enums/apis.enum';
import { Subscription } from 'rxjs';
import { PROCESS_ERROR_FILE } from 'src/app/settings/app.settings';
import { ReportsService } from '../services/reports.service';
declare var $: any;

@Component({
  selector: 'app-process-report-status-wise',
  templateUrl: './process-report-status-wise.component.html',
  styleUrls: ['./process-report-status-wise.component.css'],
})
export class ProcessReportStatusWiseComponent implements OnInit, OnDestroy {
  proceedsData: any[] = [];
  processData: any[] = [];
  proceedsError: number;
  processError: number;
  serverError: boolean = false;
  noTokenError: boolean = false;
  authFailedError: boolean = false;
  writeToExcelAlert: boolean = false;
  countComplete: number = 0;
  countCRCS: number = 0;
  countGenerate: number = 0;
  countRectification: number = 0;
  countExamine: number = 0;
  countMark: number = 0;
  countIncorporate: number = 0;
  countReject: number = 0;
  subscriber: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private useraccess: UserAccess,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.fetchErrorProceedData();
    this.fetchErrorProcessData();
  }

  fetchErrorProceedData() {
    this.subscriber.push(
      this.http
        .get(BASE_URL + CHANGE_COMPANY_OBJECT_API.FETCH_ERROR_PROCEED_DATA)
        .pipe(
          map((responseData) => {
            if (JSON.stringify(responseData).includes('No Token Provided')) {
              this.noTokenError = true;
            } else if (
              JSON.stringify(responseData).includes(
                'Authorization Failed. Token Expired. Please Login Again.'
              )
            ) {
              this.authFailedError = true;
              setTimeout(() => {
                this.useraccess.accessTypeFull = false;
                this.useraccess.accessTypePartial = false;
                this.useraccess.accessTypeMinimum = false;
                window.sessionStorage.clear();
                this.router.navigateByUrl('/');
                location.reload();
              }, 2000);
            } else {
              return responseData;
            }
          })
        )
        .subscribe(
          (response) => {
            if (this.noTokenError == false && this.authFailedError == false) {
              this.proceedsData.push(response);
              this.proceedsData = this.proceedsData[0];
              this.proceedsError = this.proceedsData.length;
              this.fetchErrorTypes();
            }
          },
          (error) => {
            this.serverError = true;
            this.showServerAlert();
          }
        )
    );
  }

  fetchErrorProcessData() {
    this.subscriber.push(
      this.http
        .get(BASE_URL + CHANGE_COMPANY_OBJECT_API.FETCH_ERROR_PROCESS_DATA)
        .pipe(
          map((responseData) => {
            if (JSON.stringify(responseData).includes('No Token Provided')) {
              this.noTokenError = true;
            } else if (
              JSON.stringify(responseData).includes(
                'Authorization Failed. Token Expired. Please Login Again.'
              )
            ) {
              this.authFailedError = true;
              setTimeout(() => {
                this.useraccess.accessTypeFull = false;
                this.useraccess.accessTypePartial = false;
                this.useraccess.accessTypeMinimum = false;
                window.sessionStorage.clear();
                this.router.navigateByUrl('/');
                location.reload();
              }, 2000);
            } else {
              return responseData;
            }
          })
        )
        .subscribe(
          (response) => {
            if (this.noTokenError == false && this.authFailedError == false) {
              this.processData.push(response);
              this.processData = this.processData[0];
              this.processError = this.processData.length;
            }
          },
          (error) => {
            this.serverError = true;
            this.showServerAlert();
          }
        )
    );
  }

  fetchErrorTypes() {
    for (var i = 0; i < this.proceedsData.length; i++) {
      if (this.proceedsData[i].NAME == 'Complete Process') {
        this.countComplete++;
      } else if (this.proceedsData[i].NAME == 'Complete CRCS Integration') {
        this.countCRCS++;
      } else if (this.proceedsData[i].NAME == 'Generate Filing Certificate') {
        this.countGenerate++;
      } else if (this.proceedsData[i].NAME == 'Rectification') {
        this.countRectification++;
      } else if (this.proceedsData[i].NAME == 'Examine Form') {
        this.countExamine++;
      } else if (this.proceedsData[i].NAME == 'Mark for Resolution') {
        this.countMark++;
      } else if (this.proceedsData[i].NAME == 'Incorporate Company UPES') {
        this.countIncorporate++;
      } else if (this.proceedsData[i].NAME == 'Reject') {
        this.countReject++;
      }
    }
    this.drawChart();
  }

  drawChart() {
    let chart = new CanvasJS.Chart('chartContainer', {
      animationEnabled: true,
      exportEnabled: true,
      data: [
        {
          type: 'pie',
          indexLabel: '{label} - {y}',
          dataPoints: [
            { y: this.countComplete, label: 'Examine Documents' },
            { y: this.countCRCS, label: 'Issue Resolution' },
            { y: this.countGenerate, label: 'Examine Form' },
            { y: this.countRectification, label: 'Rectification' },
            { y: this.countExamine, label: 'Perform Availability Search' },
            { y: this.countMark, label: 'Prepare& Print Resolution Letter' },
            { y: this.countIncorporate, label: 'Give Advice' },
            { y: this.countReject, label: 'Issue Show Cause Letter' },
          ],
        },
      ],
    });

    chart.render();
  }

  exportData() {
    this.subscriber.push(
      this.reportsService
        .exportData(
          this.proceedsData,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          'ProcessReport'
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
          PROCESS_ERROR_FILE,
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

  hideServerAlert() {
    $('#serverAlert').hide();
  }

  showServerAlert() {
    $('#serverAlert').show();
  }

  hideExcelAlert() {
    $('#excelAlert').hide();
  }

  showExcelAlert() {
    $('#excelAlert').show();
  }

  ngOnDestroy(): void {
    this.subscriber.forEach((item) => item.unsubscribe());
  }
}
