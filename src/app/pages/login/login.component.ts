import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import {HttpClient, HttpHeaders, HttpBackend} from "@angular/common/http";
import { NgForm } from "@angular/forms";
import { UserAccess } from "../../services/login-service/login.service";
import * as bootstrap from "bootstrap";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BASE_URL } from '../../constants/base-url.constant';
import { LOGIN_API } from '../../enums/apis.enum';
import { ROUTES_URL } from 'src/app/enums/routes.enum';
declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
     trigger('Enter', [
       state('flyIn', style ({transform: 'translateX(0)'})),
       transition(':enter', [
         style({transform: 'translateX(-300%)'}),
         animate('1.0s ease-out')
       ])
     ])
   ]
})
export class LoginComponent implements OnInit {

  check: boolean = false;
  unAuthorized: boolean = false;
  serverError: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router, private http: HttpClient, private useraccess: UserAccess, private httpBackend: HttpBackend)
  {
      this.http = new HttpClient(httpBackend);
  }

  ngOnInit(): void{}

  onSubmit(form: NgForm)
  {
      this.isLoading = true;
      this.http.post(BASE_URL + LOGIN_API.LOGIN_API, form.value, {responseType: "text", observe: 'response'})
      .subscribe(responseData => {

          this.serverError = false;
          sessionStorage.setItem('token', responseData.headers.get('x-access-token'));
          this.isLoading = false;

          if (JSON.stringify(responseData).includes('Full Authorization'))
          {
            this.unAuthorized = false;
            this.check = true;
            this.useraccess.fullUserAccess();
            this.useraccess.displayHeaderFooter(true);

            this.router.navigateByUrl(ROUTES_URL.HOME_URL);
            sessionStorage.setItem("cookie", form.value.usermail);
          }
          else if (JSON.stringify(responseData).includes('Partial Authorization'))
          {
            this.unAuthorized = false;
            this.check = true;
            this.useraccess.partialUserAccess();
            this.useraccess.displayHeaderFooter(true);

            this.router.navigateByUrl(ROUTES_URL.HOME_URL);
            sessionStorage.setItem("cookie", form.value.usermail);
          }
          else if (JSON.stringify(responseData).includes('Minimum Authorization'))
          {
            this.unAuthorized = false;
            this.check = true;
            this.useraccess.minimumUserAccess();
            this.useraccess.displayHeaderFooter(true);

            this.router.navigateByUrl(ROUTES_URL.HOME_URL);
            sessionStorage.setItem("cookie", form.value.usermail);
          }
          else
          {
            this.unAuthorized = true;
            this.showunAutherizedAlert();
            this.useraccess.displayHeaderFooter(false);
          }

          // this.companiesList$ = this.companyService.fetchCompaniesList();
          // this.companiesList$.subscribe(res => console.log(res));
      }
      , error => {
        this.serverError = true;
        this.showServerAlert();
        this.useraccess.displayHeaderFooter(false);
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

  hideunAutherizedAlert()
  {
    $('#unAutherizedAlert').hide();
  }

  showunAutherizedAlert()
  {
    $('#unAutherizedAlert').show();
  }

}
