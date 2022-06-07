import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserAccess } from "../../../services/login-service/login.service";
import { map } from 'rxjs/operators';
import * as bootstrap from "bootstrap";
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { BANK_COMPANY_LOG_API } from '../../../enums/apis.enum';
declare var $: any;

@Component({
  selector: 'app-bank-transaction-log',
  templateUrl: './bank-transaction-log.component.html',
  styleUrls: ['./bank-transaction-log.component.css']
})
export class BankTransactionLogComponent implements OnInit {

  bankData: any [] = [];
  searchedBankData: any [] = [];
  allowEntity: boolean = false;
  allowDate: boolean = false;
  hasSearchedData: boolean = false;
  dataUnavailable: boolean = false;
  serverError: boolean = false;
  noTokenError: boolean = false;
  authFailedError: boolean = false;
  searchDataKey: string;
  startDateKey: string;
  endDateKey: string;
  enabledByDefault: boolean = true;

  constructor(private http: HttpClient, private useraccess: UserAccess, private router: Router) { }

  ngOnInit(): void
  {
    this.fetchBankLogData();
  }

  searchEntity()
  {
    this.startDateKey = "";
    this.endDateKey = "";
    this.allowEntity = true;
    this.allowDate = false;
    this.enabledByDefault = true;
  }

  searchDate()
  {
    this.searchDataKey = "";
    this.allowDate = true;
    this.allowEntity = false;
    this.enabledByDefault = false;
  }

  fetchBankLogData()
  {
    this.http.get(BASE_URL + BANK_COMPANY_LOG_API.FETCH_BANK_DATA)
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
        this.bankData.push(response);
        this.bankData = this.bankData[0];
      }
    }
    ,error => {
      this.serverError = true;
      this.showServerAlert();
    })
  }

  searchBankLogDataEntity()
  {
    this.dataUnavailable = false;
    this.searchedBankData = [];
    const params = new HttpParams().set('id', this.searchDataKey);

    this.http.get(BASE_URL + BANK_COMPANY_LOG_API.SEARCH_BANK_DATA_ENTITY, {params})
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
          this.searchedBankData.push(response);
          this.searchedBankData = this.searchedBankData[0];
          if(this.searchedBankData.length == 0)
          {
            this.dataUnavailable = true;
          }
        }
    }
    ,error => {
      this.serverError = true;
      this.showServerAlert();
    })
    this.hasSearchedData = true;
  }

  searchBankLogDataDate()
  {
    this.dataUnavailable = false;
    this.searchedBankData = [];
    const params = new HttpParams().set('id', this.startDateKey).set('id2', this.endDateKey);

    this.http.get(BASE_URL + BANK_COMPANY_LOG_API.SEARCH_BANK_DATA_DATE, {params})
    .pipe(map(responseData => {

      if(JSON.stringify(responseData).includes('No Token Provided'))
      {
        this.noTokenError =  true;
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
        this.searchedBankData.push(response);
        this.searchedBankData = this.searchedBankData[0];
        if(this.searchedBankData.length == 0)
        {
          this.dataUnavailable = true;
        }
      }
    }
    ,error => {
      this.serverError = true;
      this.showServerAlert();
    })
    this.hasSearchedData= true;
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
