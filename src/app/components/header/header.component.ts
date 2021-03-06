import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserAccess } from '../../services/login-service/login.service';
import * as bootstrap from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ROUTES_URL } from 'src/app/enums/routes.enum';
import { HeaderService } from 'src/app/services/header-service/header.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userA = false;
  userB = false;
  userC = false;
  noTokenError = false;
  authFailedError = false;
  routes: any = ['/records', '/process', '/companyuser'];
  serverError = false;

  readonly homeUrl = ROUTES_URL.HOME_URL;
  readonly applicationManagementUrl = ROUTES_URL.APPLICATION_MANAGEMENT_URL;
  readonly eservicesManagementUrl = ROUTES_URL.ESERVICES_MANAGEMENT_URL;
  readonly helpUrl = ROUTES_URL.HELP_URL;
  readonly logoutUrl = ROUTES_URL.LOG_OUT_URL;
  readonly userprofileUrl = ROUTES_URL.USER_PROFILE;
  readonly requestLogUrl = ROUTES_URL.REQUEST_LOG_URL;

  subscriber: Subscription[] = [];

  constructor(
    private useraccess: UserAccess,
    private http: HttpClient,
    private router: Router,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    if (this.useraccess.accessTypeFull == true) {
      this.userA = true;
      this.userB = false;
      this.userC = false;
    } else if (this.useraccess.accessTypePartial == true) {
      this.userB = true;
      this.userA = false;
      this.userC = false;
    } else if (this.useraccess.accessTypeMinimum == true) {
      this.userC = true;
      this.userA = false;
      this.userB = false;
    }
    this.fetchUserRights();
  }

  fetchUserRights() {
    this.subscriber.push(
      this.headerService.fetchUserRights().subscribe(
        (responseData) => {
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
              this.router.navigateByUrl(ROUTES_URL.LOGIN_URL);
              location.reload();
            }, 2000);
          } else {
            this.routes = responseData;
            for (let i = 0; i < this.routes.length; i++) {
              this.routes[i].routes =
                ROUTES_URL.REPORTS_URL + this.routes[i].routes;
            }
          }
        },
        (error) => {
          this.serverError = true;
          this.showServerAlert();
        }
      )
    );
  }

  showServerAlert() {
    $('#myServerAlert').show();
  }

  hideMyServerAlert() {
    $('#myServerAlert').hide();
  }

  ngOnDestroy(): void {
    this.subscriber.forEach((subscription) => subscription.unsubscribe());
  }
}
