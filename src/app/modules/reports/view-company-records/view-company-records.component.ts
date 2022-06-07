import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserAccess } from "../../../services/login-service/login.service";
import * as bootstrap from "bootstrap";
import { Router } from '@angular/router';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ElementRef } from '@angular/core';
import { BASE_URL } from '../../../constants/base-url.constant';
import { FEATURE_API, PRODUCTS_API } from '../../../enums/apis.enum';
import { EXTERNAL_URLS } from '../../../constants/external-urls.constant';
import { DEBOUNCE_TIME } from 'src/app/settings/app.settings';
declare var $: any;

@Component({
  selector: 'app-view-company-records',
  templateUrl: './view-company-records.component.html',
  styleUrls: ['./view-company-records.component.css']
})
export class ViewCompanyRecordsComponent implements OnInit {

  checkCompany: boolean = true;
  checkIncorporation: boolean = false;
  checkArchive: boolean = false;
  checkEServices: boolean = true;
  serverError: boolean = false;
  formAlert: boolean = false;
  emptyFormError: boolean = false;
  dataAvailable: boolean = false;
  containsData: boolean = false;
  containsNoData: boolean = false;
  noTokenError: boolean = false;
  authFailedError: boolean = false;
  spinnerLoading: boolean;
  companyName: string;
  incorporationNumber: string;
  archiveDocumentType = 'Select Document Type';
  documentStatus: string = 'Select Document Status';
  sortBy: string = 'Sort by';
  processName: string = 'Select Process Name';
  startDate: string = 'start date';
  endDate: string = 'end date';
  fetchedData: any [] = [];
  cardCheckArray: any[] = [];
  internalDocs: any []= [];
  internalDocsFileStatus: boolean = false;
  spinnerLoading2: boolean = false;
  InternalDocDataFetch: boolean = false;
  notingDataFetch: boolean = false;
  fileResponse: string;
  fileResponseName: string;
  fileResponseLink: string;
  notingResponse: any[] = [];
  notingResponseToDisplay: any[] = [];
  notingResponseStatus: boolean = false;
  enabledByDefault: boolean = true;
  dataUnAvailable = false;
  companiesName = [''];

  constructor(private http: HttpClient, private router: Router, private useraccess: UserAccess, private elref: ElementRef) { }

  ngOnInit(): void {}

  processListByCompany()
  {
    const params = new HttpParams().set('id', this.companyName)
    this.companiesName = [];
    this.http.get<{[key: string] : any}>(BASE_URL + PRODUCTS_API.PROCESS_LIST_BY_COMPANY_NAME, {params})
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
           return responseData.rows;
        }
    }), 
      debounceTime(DEBOUNCE_TIME), 
      distinctUntilChanged()
    )
    .subscribe(posts => {

      if(this.authFailedError == false && this.noTokenError == false)
      {
        posts.forEach((item, index)=> this.companiesName.push(posts[index][1]));
      }
    }
    ,error => {

        this.serverError = true;
        this.showServerAlert();
    })
  }
  
  goBack()
  {
    this.dataAvailable = false;
    this.spinnerLoading = false;
  }

  fetchData()
  {
    this.emptyFormError = false;
    this.containsNoData = false;
    this.containsData = false;
    this.dataAvailable = false;
    this.fetchedData = [];
    this.cardCheckArray = [];

    if((this.checkCompany == true) && (this.checkEServices == true))
    {
      if(this.companyName == undefined || this.companyName == null)
      {
        this.emptyFormError = true;
        return;
      }

      this.spinnerLoading = true;

      const params = new HttpParams().set('id', this.companyName).set('id2', this.documentStatus).set('id3', this.sortBy)
                      .set('id4', this.processName).set('id5', this.startDate).set('id6', this.endDate);

      this.http.get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NAME_IN_ESERVICES, {params})
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
          Object.keys(response).length === 0 ? (this.containsNoData = true, this.spinnerLoading = false) : this.containsData = true;
          this.dataAvailable = true;
          this.fetchedData.push(response);
          this.fetchedData = this.fetchedData[0];
          this.companyName = null;

          this.fetchedData.length === 0 ? this.dataUnAvailable = true : this.dataUnAvailable = false;

          var swap = this.fetchedData[0].PROCESS_NAME;
          for (var x in this.fetchedData)
          {
            if(swap == this.fetchedData[x].PROCESS_NAME)
            {
              continue;
            }
            else
            {
              this.cardCheckArray.push(swap);
              swap = this.fetchedData[x].PROCESS_NAME;
            }
          }
          this.cardCheckArray.push(swap);

          for (var x in this.fetchedData)
          {
            this.fetchedData[x].DOCUMENT_NAME = this.fetchedData[x].DOCUMENT_NAME.split(' ').join('%20');
            this.fetchedData[x].DOCUMENT_NAME = EXTERNAL_URLS.DOCUMENT_URL + this.fetchedData[x].DOCUMENT_NAME;
          }

          this.spinnerLoading = false;
      }
      , error => {
          this.serverError = true;
          this.showServerAlert();
      })
    }

    else if((this.checkIncorporation == true) && (this.checkEServices == true))
    {
      if(this.incorporationNumber == undefined || this.incorporationNumber == null)
      {
          this.emptyFormError = true;
          return;
      }

      this.spinnerLoading = true;
      const params = new HttpParams().set('id', this.incorporationNumber).set('id2', this.documentStatus).set('id3', this.sortBy)
                      .set('id4', this.processName).set('id5', this.startDate).set('id6', this.endDate);

      this.http.get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NUMBER_IN_ESERVICES, {params})
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
        
        Object.keys(response).length === 0 ? (this.containsNoData = true, this.spinnerLoading = false) : this.containsData = true;

        this.dataAvailable = true;
        this.fetchedData.push(response);
        this.fetchedData = this.fetchedData[0];
        this.incorporationNumber = null;

        this.fetchedData.length === 0 ? this.dataUnAvailable = true : this.dataUnAvailable = false;

        var swap = this.fetchedData[0].PROCESS_NAME;

        for (var x in this.fetchedData)
        {
          if(swap == this.fetchedData[x].PROCESS_NAME)
          {
            continue;
          }
          else
          {
            this.cardCheckArray.push(swap);
            swap = this.fetchedData[x].PROCESS_NAME;
          }
        }
        this.cardCheckArray.push(swap);

        this.spinnerLoading = false;
      }
      , error => {
        this.serverError = true;
        this.showServerAlert();
      })
    }

    else if((this.checkCompany == true) && (this.checkArchive == true))
    {
        if(this.companyName == undefined || this.companyName == null)
        {
            this.emptyFormError = true;
            return;
        }

        this.spinnerLoading = true;
        const params = new HttpParams().set('id', this.companyName).set('id2', this.archiveDocumentType)
        this.http.get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NAME_IN_ARCHIVE, {params})
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

          Object.keys(response).length === 0 ? (this.containsNoData = true, this.spinnerLoading = false) : this.containsData = true;

          this.dataAvailable = true;
          this.fetchedData.push(response);
          this.fetchedData = this.fetchedData[0];
          this.companyName = null;

          this.fetchedData.length === 0 ? this.dataUnAvailable = true : this.dataUnAvailable = false;

          this.spinnerLoading = false;
        }
      , error => {
        this.serverError = true;
        this.showServerAlert();
      })
    }

    else if((this.checkIncorporation == true) && (this.checkArchive == true))
    {
        if(this.incorporationNumber == undefined || this.incorporationNumber == null)
        {
            this.emptyFormError = true;
            return;
        }

        this.spinnerLoading = true;
        const params = new HttpParams().set('id', this.incorporationNumber).set('id2', this.archiveDocumentType)
        this.http.get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NUMBER_IN_ARCHIVE, {params})
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

          Object.keys(response).length === 0 ? (this.containsNoData = true, this.spinnerLoading = false) : this.containsData = true;

          this.dataAvailable = true;
          this.fetchedData.push(response);
          this.fetchedData = this.fetchedData[0];
          this.incorporationNumber = null;

          this.fetchedData.length === 0 ? this.dataUnAvailable = true : this.dataUnAvailable = false;
          
          this.spinnerLoading = false;

        }
      , error => {
        this.serverError = true;
        this.showServerAlert();
      })
    }

    console.log(this.cardCheckArray);

    // for(let i = 0; i < this.cardCheckArray.length; i++) {
      
    //   let b = this.cardCheckArray[i].split(')');

    //   b[0] = b[0]+' ) - ';

    //   b = b[0]+b[1];

    //   this.cardCheckArray[i] = b;
    // }

  }

  viewInternalDocs(arrayValue: string)
  {
    this.internalDocs = [];
    this.internalDocsFileStatus = false;
    this.InternalDocDataFetch = false;
    this.spinnerLoading2 = false;
    this.spinnerLoading2 = true;
    var arraycheck = arrayValue.match(/\d/g);
    var userProcessID = arraycheck.join("");
    var compFldrID;

    for(var x in this.fetchedData)
    {
      if(this.fetchedData[x].USER_PROCESS_ID == userProcessID)
      {
        compFldrID = this.fetchedData[x].COMP_PID;
      }
    }
      const bodytoSend = {compFldrID: compFldrID, userProcessID: userProcessID}
      this.http.post(EXTERNAL_URLS.INTERNAL_DOCUMENT_URL, bodytoSend, {headers: {"caller" : sessionStorage.getItem("cookie"), "ip-address": "0.0.0.0", "Content-Type": "application/json"}})
      .subscribe(response => {
        this.internalDocs.push(response);
        this.InternalDocDataFetch = true;
        if(this.internalDocs[0].response.length <= 0)
        {
          this.spinnerLoading2 = false;
          this.internalDocsFileStatus = true;
        }
        else
        {
          this.spinnerLoading2 = false;
          this.internalDocsFileStatus = false;
          this.fileResponse = this.internalDocs[0].response;

          var newstringDoc = this.fileResponse.split("=").pop().split(">")[0];
          var newstringDocName = this.fileResponse.split("=").pop().split(">")[1];

          var newstringDocLink = EXTERNAL_URLS.SERVLET_DOCUMENT + newstringDoc;
          var newstringDocNameLink = newstringDocName.split("<")[0];

          this.fileResponseLink = newstringDocLink;
          this.fileResponseName = newstringDocNameLink;
        }
      }
      , error => {
        this.serverError = true;
        this.showServerAlert();
      })
  }

  viewNoting(data: string)
  {
    this.notingResponse = [];
    this.notingResponseToDisplay = [];
    this.notingDataFetch = false;
    this.spinnerLoading2 = false;
    this.notingResponseStatus = false;
    this.spinnerLoading2 = true;
    var arraycheck = data.match(/\d/g);
    var userProcessID = arraycheck.join("");
    var pfid;

    for(var x in this.fetchedData)
    {
      if(this.fetchedData[x].USER_PROCESS_ID == userProcessID)
      {
        pfid = this.fetchedData[x].PROCESS_FLDR_ID;
      }
    }

    this.http.get(EXTERNAL_URLS.NOTING_SHEET + pfid, {headers: {"caller": sessionStorage.getItem("cookie"), "ip-address": "0.0.0.0"}})
    .subscribe(response => {
      this.notingResponse.push(response);
      this.notingDataFetch = true;

      if(this.notingResponse[0].response.length <= 0)
      {
        this.spinnerLoading2 = false;
        this.notingResponseStatus = true;
      }

      else
      {
        this.spinnerLoading2 = false;
        this.notingResponseStatus = false;
        var newNoting = this.notingResponse[0].response.split("<<").join("").split(">>");

        for(var x in newNoting)
        {
          if(newNoting[x].length >= 5)
          this.notingResponseToDisplay.push(newNoting[x]);
        }
      }

    })
  }

  changeDocsStatus()
  {
    this.internalDocsFileStatus = false;
    this.InternalDocDataFetch = false;
    this.notingResponseStatus = false;
    this.notingDataFetch = false;
  }

  companySelect()
  {
    this.checkCompany = true;
    this.checkIncorporation = false;
    this.enabledByDefault = true;
  }

  incorporationSelect()
  {
    this.checkIncorporation = true;
    this.checkCompany = false;
    this.enabledByDefault = false;
  }

  eServicesSelect()
  {
    this.checkEServices = true;
    this.checkArchive = false;
  }

  archiveSelect()
  {
    this.checkArchive = true;
    this.checkEServices = false;
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
