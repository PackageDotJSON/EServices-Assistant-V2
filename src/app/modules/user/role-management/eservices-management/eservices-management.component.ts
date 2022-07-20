import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-eservices-management',
  templateUrl: './eservices-management.component.html',
  styleUrls: ['./eservices-management.component.css'],
})
export class EservicesManagementComponent implements OnInit, OnDestroy {
  eservicesData$: Observable<any>;
  searchDataKey: string;
  eServicesForm: FormGroup;
  subscriber: Subscription;
  isResponseRetrieved = false;
  isSuccess = false;
  isError = false;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
    this.eServicesForm = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      userId: [null, [Validators.required]],
      userStatus: [null, [Validators.required]],
      userCell: [null, [Validators.required]],
      userEmail: [null, [Validators.required]],
      isUserMigrated: [null, [Validators.required]],
      createdBy: [null, [Validators.required]],
      createdWhen: [null, [Validators.required]],
      modifiedBy: [null, [Validators.required]],
      modifiedWhen: [null, [Validators.required]],
      userGender: [null, [Validators.required]],
      userCro: [null, [Validators.required]],
      businessCategory: [null, [Validators.required]],
      employeeType: [null, [Validators.required]],
      adUser: [null, [Validators.required]],
      userPassword: [null, [Validators.required]],
      employeeId: [null, [Validators.required]],
      userDesignation: [null, [Validators.required]],
      userDepartment: [null, [Validators.required]],
      userLocation: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.eservicesData$ = this.userService.fetchEServicesData();
  }

  searchData() {
    this.eservicesData$ = this.userService.searchEServicesData(
      this.searchDataKey
    );
  }

  submitData() {
    this.isResponseRetrieved = this.isError = false;

    if (Object.values(this.eServicesForm.value).includes(null)) {
      this.isError = true;
      return;
    }
    this.subscriber = this.userService
      .postEServicesData(this.eServicesForm.value)
      .pipe(
        tap((res) => {
          this.isResponseRetrieved = true;
          res === 'Success'
            ? ((this.isSuccess = true), this.eServicesForm.reset())
            : (this.isSuccess = false);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscriber?.unsubscribe();
  }
}
