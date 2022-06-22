import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { UserAccess } from '../../../services/login-service/login.service';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { PRODUCTS_API } from '../../../enums/apis.enum';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-view-company-submission-mode',
  templateUrl: './view-company-submission-mode.component.html',
  styleUrls: ['./view-company-submission-mode.component.css'],
})
export class ViewCompanySubmissionModeComponent implements OnInit, OnDestroy {
  dataAvailable = false;
  dataUnAvailable = false;
  checkCompany = true;
  checkIncorporation = false;
  companyName: string;
  incorporationNumber: number;
  companyData: any[] = [];
  displayincorpData = true;
  displaycompanyData = true;
  serverError = false;
  noTokenError = false;
  authFailedError = false;
  enabledByDefault = true;
  subscriber: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private useraccess: UserAccess,
    private router: Router
  ) {}

  ngOnInit(): void {}

  companySelect() {
    this.companyData = [];
    this.checkCompany = true;
    this.checkIncorporation = false;
    this.enabledByDefault = true;
  }

  incorporationSelect() {
    this.companyData = [];
    this.checkIncorporation = true;
    this.checkCompany = false;
    this.enabledByDefault = false;
  }

  processList() {
    if (this.companyName == '' || this.companyName == undefined) {
      this.processListByNum();
    } else if (this.incorporationNumber == null) {
      this.processListByCompany();
    }
  }

  processListByCompany() {
    const params = new HttpParams().set('id', this.companyName);
    this.companyData = [];
    this.subscriber.push(
      this.http
        .get<{ [key: string]: any }>(
          BASE_URL + PRODUCTS_API.PROCESS_LIST_BY_COMPANY_NAME,
          { params }
        )
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
              return responseData.rows;
            }
          })
        )
        .subscribe(
          (posts) => {
            if (this.authFailedError == false && this.noTokenError == false) {
              this.companyData.push(posts);

              if (this.companyData[0].length != 0) {
                this.dataAvailable = true;
                this.dataUnAvailable = false;
              } else {
                this.dataUnAvailable = true;
                this.dataAvailable = false;
              }
              this.companyName = '';
            }
          },
          (error) => {
            this.serverError = true;
            this.showServerAlert();
          }
        )
    );
  }

  processListByNum() {
    const test = JSON.stringify(this.incorporationNumber);
    const params = new HttpParams().set('id', test);
    this.companyData = [];

    this.subscriber.push(
      this.http
        .get<{ [key: string]: any }>(
          BASE_URL + PRODUCTS_API.PROCESS_LIST_BY_NUMBER,
          { params }
        )
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
              return responseData.rows;
            }
          })
        )
        .subscribe(
          (posts) => {
            if (this.authFailedError == false && this.noTokenError == false) {
              this.companyData.push(posts);

              if (this.companyData[0].length != 0) {
                this.dataAvailable = true;
                this.dataUnAvailable = false;
              } else {
                this.dataUnAvailable = true;
                this.dataAvailable = false;
              }
              this.incorporationNumber = null;
            }
          },
          (error) => {
            this.serverError = true;
            this.showServerAlert();
          }
        )
    );
  }

  hideCard() {
    this.displayincorpData = false;
    this.displaycompanyData = false;
  }

  showCard() {
    this.displayincorpData = true;
    this.displaycompanyData = true;
  }

  showServerAlert() {
    $('#serverAlert').show();
  }

  hideServerAlert() {
    $('#serverAlert').hide();
  }

  ngOnDestroy(): void {
    this.subscriber.forEach((subscription) => subscription.unsubscribe());
  }
}