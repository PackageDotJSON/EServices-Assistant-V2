import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { UserAccess } from "../../../services/login-service/login.service";
import * as bootstrap from "bootstrap";
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { DEACTIVATE_COMPANY_API } from '../../../enums/apis.enum';
declare var $: any;

@Component({
  selector: 'app-deactivatecompany',
  templateUrl: './deactivatecompany.component.html',
  styleUrls: ['./deactivatecompany.component.css']
})
export class DeactivatecompanyComponent implements OnInit {

  ctcTableData : any [] = [];
  searchDataKey : string;
  dataNotAvailable: boolean = false;
  noTokenError: boolean = false;
  authFailedError: boolean = false;
  serverError: boolean = false;

  constructor(private http: HttpClient, private useraccess: UserAccess, private router: Router) { }

  ngOnInit()
  {
    this.searchAppliedCTCReport();
  }

  searchAppliedCTCReport()
  {
    this.dataNotAvailable = false;
    this.ctcTableData = [];
    this.http.get(BASE_URL + DEACTIVATE_COMPANY_API.FETCH_APPLIED_CTC_TABLE)
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
        this.ctcTableData.push(response);
        this.ctcTableData = this.ctcTableData[0];

        if(this.ctcTableData.length == 0)
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

  hideServerAlert()
  {
    $('#serverAlert').hide();
  }

  showServerAlert()
  {
    $('#serverAlert').show();
  }

}
