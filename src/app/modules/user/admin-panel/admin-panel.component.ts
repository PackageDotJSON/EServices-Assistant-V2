import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { NgForm } from "@angular/forms";
import { Admin } from "../../../models/adminpanel.model";
import { UserAccess } from "../../../services/login-service/login.service";
import * as bootstrap from "bootstrap";
import { Router } from '@angular/router';
import { ADMIN_API } from '../../../enums/apis.enum';
import { BASE_URL } from '../../../constants/base-url.constant';
declare var $: any;

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminpanelComponent implements OnInit {

  constructor(private http: HttpClient, private useraccess: UserAccess, private router: Router) { }
  adminData: Admin[] = [];
  subAdminData: any[] = [];
  subAdminAllData: any[] = [];
  subAdminAllRoles: any[] = [];
  userRightsToDelete: any[] = [];
  adminRights: string = "Select admin rights";
  mail: string;
  totalUsers: string;
  paginationLimitDisplay : number = 10;
  paginationLimit : number = 10;
  paginationNumber : number = 0;
  forwardButton: boolean = true;
  backwardButton: boolean = true;
  searchDataKey : string;
  searchData: Admin[] = [];
  searchingData : boolean = false;
  noDataFound : boolean = false;
  dataUpdated: boolean = false;
  dataAdded: boolean = false;
  emailExists: boolean = false;
  additionalRights: boolean = false;
  noTokenError: boolean = false;
  authFailedError: boolean = false;
  serverError: boolean = false;
  toggleButton: boolean = false;
  fieldsEmptyAlert: boolean = false;
  passwordLengthAlert: boolean = false;
  formSubmitted: boolean = false;
  userRightsSelected: boolean = false;
  deleteEmptyAlert: boolean = false;
  responseData1: any = [];
  responseData2: any = [];
  updatedUserRights: any [] = [];
  updatedUserRightsToSend: any[] = [];

  ngOnInit()
  {
    this.calculateDataApi();
    this.fetchAdminDataApi();
  }

  incrementData()
  {
    this.paginationNumber += 10;
    this.paginationLimitDisplay += 10;
  }

  decrementData()
  {
    this.paginationNumber -= 10;
    this.paginationLimitDisplay -= 10;
  }

  calculateDataApi()
  {
    this.http.get(BASE_URL + ADMIN_API.TOTAL_DATA)
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
    .subscribe(posts => {

      if(this.noTokenError == false && this.authFailedError == false)
      {
          this.totalUsers = posts[0].TOTAL;
      }
    }
    ,error => {
        this.serverError = true;
        this.showServerAlert();
    })
  }

  fetchAdminDataApi()
  {
      const num = JSON.stringify(this.paginationLimit);
      const num2 = JSON.stringify(this.paginationNumber);
      const params = new HttpParams().set('id', num).set('id2', num2);
      this.http.get<{[key: string]: Admin}>(BASE_URL + ADMIN_API.ADMIN_DATA, {params})
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
            const postsArray:Admin[] = [];
            for(const key in responseData)
            {
              if(responseData.hasOwnProperty(key))
              {
                postsArray.push({...responseData[key], idadmin:key});
              }
            }
            if(postsArray.length < this.paginationLimit)
            {
              this.forwardButton = false;
            }
            else
            {
              this.forwardButton = true;
            }

            return postsArray;
          }
      }))
      .subscribe(posts => {

        if(this.noTokenError == false && this.authFailedError == false)
        {
          this.adminData = posts;

          if(this.adminData[0].id < 5)
          {
            this.backwardButton = false;
          }
          else
          {
            this.backwardButton = true;
          }
        }
      }
      , error =>{
          this.serverError = true;
          this.showServerAlert();
      })
  }

  fetchSubAdminDataApi(userMail: any, rightsAdmin: any)
  {
    this.adminRights = rightsAdmin;
    this.subAdminData = [];
    this.subAdminAllData = [{roles: 'Search Bank Transaction Log'}, {roles: 'CTC Filing Status Report'}, {roles: 'Applied CTC Report'}, {roles: 'Process Report - Status Wise'}, {roles: 'View Company Records'}, {roles: 'View Company Submission Mode'}, {roles: 'CTC Comparison Report'}, {roles: 'Bank Usage Report'}, {roles: 'Data Sharing Monitoring Report'}]
    const params = new HttpParams().set('id', userMail)
    this.http.get(BASE_URL + ADMIN_API.SUB_ADMIN_DATA, {params})
    .pipe(map(responseData => {
        return responseData;
    }))
    .subscribe(response => {

        this.subAdminData.push(response);
        this.subAdminData = this.subAdminData[0];

        for(var i = 0; i < this.subAdminData.length; i++)
        {
            for(var j = 0; j < this.subAdminAllData.length; j++)
            {
              if(this.subAdminData[i].roles == this.subAdminAllData[j].roles)
              {
                this.subAdminAllData.splice(j, 1);
              }
            }
        }
    }
    , error => {
      this.serverError = true;
      this.showServerAlert();
    })
  }

  updateUserSubRights()
  {
    for(var i = 0; i < this.updatedUserRights.length; i++)
    {
        if(this.subAdminAllData.length != 0)
        {
            this.subAdminData.push({roles: this.updatedUserRights[i]});
            this.updatedUserRightsToSend.push(this.updatedUserRights[i]);
        }
        else
        {
            this.toggleButton = true;
            return 0;
        }
    }

    for(var i = 0; i < this.subAdminAllData.length; i++)
    {
      for(var j = 0; j < this.subAdminAllData.length; j++)
      {
        if(this.updatedUserRights[j] == this.subAdminAllData[i].roles)
        {
          this.subAdminAllData.splice(i, 1);
        }
      }
    }
  }

  rightToUpdate(mail: string)
  {
    this.mail = mail;
  }

  modifyAdminDataApi()
  {
    if (this.adminRights != 'minimum' && this.updatedUserRightsToSend.length <= 0)
    {
      this.userRightsSelected = true;
      this.showMyuserRightsAlert();
      return 0;
    }

    this.userRightsSelected = false;
    this.hideModal2();
    const params = new HttpParams().set('id', this.adminRights).set('id2', this.mail);

    this.http.put(BASE_URL + ADMIN_API.MODIFY_RIGHTS, null ,{params})
    .subscribe(responseData => {

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
        this.searchingData = false;
        this.dataUpdated = true;
        this.ngOnInit();
      }
    } , error => {
          this.serverError = true;
          this.showServerAlert();
    })
  }

  modifySubAdminDataApi()
  {
    if(this.adminRights == 'minimum')
    {
      return 0;
    }

    else if (this.adminRights != 'minimum' && this.updatedUserRightsToSend.length <= 0)
    {
      this.userRightsSelected = true;
      this.showMyuserRightsAlert();
      return 0;
    }

    this.userRightsSelected = false;
    this.hideModal2()
    this.subAdminAllRoles = [];
    for(var i = 0; i < this.updatedUserRightsToSend.length; i++)
    {
      this.subAdminAllRoles.push('/'+this.updatedUserRightsToSend[i].toLowerCase().split(" ").join(""));
    }

    const params = new HttpParams().set('id', this.mail);

    this.http.post(BASE_URL + ADMIN_API.MODIFY_SUB_RIGHTS, {rights: this.updatedUserRightsToSend, roles: this.subAdminAllRoles}, {params})
    .subscribe(responseData => {
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
          this.searchingData = false;
          this.dataUpdated = true;
        }
    }
    , error => {
        this.serverError = true;
        this.showServerAlert();
    })
  }


  deleteUserSubRights()
  {
    if(this.userRightsToDelete.length == 0)
    {
      this.deleteEmptyAlert = true;
      this.showMyDeleteAlert();
      return 0;
    }

    if(this.userRightsToDelete.length > 1)
    {
      this.deleteEmptyAlert = true;
      this.showMyDeleteAlert();
      return 0;
    }

    this.deleteEmptyAlert = false;
    const options = JSON.stringify(this.userRightsToDelete);
    this.subAdminAllData.push({roles: this.userRightsToDelete});

    for(var i = 0; i < this.subAdminData.length; i++)
    {
      for(var j = 0; j < this.subAdminData.length; j++)
      {
        if(this.userRightsToDelete[j] == this.subAdminData[i].roles)
        {
          this.subAdminData.splice(i, 1);
        }
      }
    }

    const params = new HttpParams().set('id', options).set('id2', this.mail);

    this.http.delete(BASE_URL + ADMIN_API.DELETE_SUB_RIGHTS, {params})
    .subscribe(responseData =>{

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
          this.searchingData = false;
          this.dataUpdated = true;
          this.ngOnInit();
        }
    }
    , error => {
        this.serverError = true;
        this.showServerAlert();
    })
  }

  searchDataApi()
  {
    this.searchingData = true;
    const params = new HttpParams().set('id', this.searchDataKey)
    this.searchDataKey = "";
    this.http.get<{[key: string] : Admin}>(BASE_URL + ADMIN_API.SEARCH_DATA, {params})
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
          const postsArray : Admin[] = [];
          for(const key in responseData)
          {
            if(responseData.hasOwnProperty(key))
            {
              postsArray.push({...responseData[key], idadmin: key});
            }
          }

          if(postsArray.length <= 0)
          {
              this.noDataFound = true;
          }
          else
          {
            this.noDataFound = false;
          }

          return postsArray;
        }
    }))
    .subscribe(posts => {

      if(this.noTokenError == false && this.authFailedError == false)
      {
          this.searchData = posts;
      }

    }
    , error => {
          this.serverError = true;
          this.showServerAlert();
    })
  }

  postDataApi(form: NgForm)
  {
     if((form.value.fullPersonName.length <= 0) || (form.value.mailPerson.length <= 0) || (form.value.employeeidPerson.length <= 0) ||
        (form.value.samaccountPerson.length <= 0) || (form.value.activeDirectoryPerson.length <= 0) || (form.value.jobRolePerson.length <= 0) ||
        (form.value.jobStatusPerson.length <= 0) || (form.value.locationPerson.length <= 0) || (form.value.departmentPerson.length <= 0) ||
        (form.value.adminRightsPerson.length <= 0))
     {
        this.formSubmitted = false;
        this.fieldsEmptyAlert = true;
        this.showMyFieldsAlert();
        return;
     }

     else if((form.value.adminRightsPerson != 'minimum') && (form.value.additionalRightsPerson.length <= 0))
     {
       this.formSubmitted = false;
       this.passwordLengthAlert = false;
       this.fieldsEmptyAlert = true;
       this.showMyFieldsAlert();
       return;
     }

     else if(form.value.codePerson.length < 8)
     {
       this.formSubmitted = false;
       this.fieldsEmptyAlert = false;
       this.passwordLengthAlert = true;
       this.showMyPasswordAlert();
       return
     }

     else
     {
       this.passwordLengthAlert = false;
       this.fieldsEmptyAlert = false;
       this.formSubmitted = true;
       this.hideModal();
     }

     this.http.post(BASE_URL + ADMIN_API.POST_DATA, form.value, {responseType: 'text'})
     .subscribe(responseData =>{

        if(responseData == 'No Token Provided')
        {
          this.noTokenError = true;
        }

        else if(responseData == 'Authorization Failed. Token Expired. Please Login Again.')
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

        else if(responseData == 'User data added successfully')
        {
          this.dataAdded = true;
          this.ngOnInit();
        }

        else if(responseData == 'Email already exists')
        {
          this.emailExists = true;
          this.showMyEmailAlert();
        }
     }
   ,error => {
       this.serverError = true;
       this.showServerAlert();
   })
   form.reset();
  }

  showServerAlert()
  {
    $('#myServerAlert').show();
  }

  hideMyServerAlert()
  {
    $('#myServerAlert').hide();
  }

  showAdditionalRights()
  {
    this.additionalRights = true;
  }

  hideAdditionalRights()
  {
    this.additionalRights = false;
  }

  hideModal()
  {
    if(this.formSubmitted == true)
    {
      $('#exampleModal2').modal('hide');
    }
  }

  hideModal2()
  {
    $('#exampleModal').modal('hide');
  }


  hideMyAlert()
  {
    $('#myUpdateAlert').hide();
  }

  hideMyNewDataAlert()
  {
    $('#myNewDataAlert').hide()
  }

  hideMyEmailAlert()
  {
    $('#myEmailAlert').hide();
  }

  showMyEmailAlert()
  {
    $('#myEmailAlert').show();
  }

  hideMyFieldsAlert()
  {
  $('#myfieldsAlert') .hide()
  }

  showMyFieldsAlert()
  {
    $('#myfieldsAlert').show()
  }

  showMyPasswordAlert()
  {
    $('#myPasswordLengthAlert').show()
  }

  hideMyPasswordAlert()
  {
    $('#myPasswordLengthAlert').show()
  }

  showMyuserRightsAlert()
  {
    $('#myuserRightsAlert').show()
  }

  hideMyuserRightsAlert()
  {
    $('#myuserRightsAlert').hide()
  }

  hideMyDeleteAlert()
  {
    $('#myDeleteAlert').hide()
  }

  showMyDeleteAlert()
  {
    $('#myDeleteAlert').show()
  }
}
