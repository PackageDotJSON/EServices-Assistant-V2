import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { tap } from 'rxjs/operators';
import { ForgotPasswordService } from 'src/app/services/forgot-password-service/forgot-password.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES_URL } from 'src/app/enums/routes.enum';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  animations: [
    trigger('Enter', [
      state('flyIn', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        style({ transform: 'translateX(-300%)' }),
        animate('1.0s ease-out'),
      ]),
    ]),
  ],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  userEmail: string;
  emailIsValid = false;
  dataReceived = false;
  subscriber: Subscription[] = [];
  verificationCode: number;
  isVerificationCodeValid = false;
  verificationCodeReceived = false;
  newPassword = null;
  verifyNewPassword = undefined;
  passwordError: string;
  readonly loginUrl = ROUTES_URL.LOGIN_URL;

  constructor(
    private password: ForgotPasswordService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscriber.push(
      this.activatedRoute.queryParams
        .pipe(
          tap((res) => {
            if (res) {
              this.isVerificationCodeValid =
                this.verificationCodeReceived =
                this.emailIsValid =
                  res.verificationcodevalid;
              this.userEmail = res.useremail;
            }
          })
        )
        .subscribe()
    );
  }

  onForgotPasswordSubmit() {
    if (this.dataReceived === true && this.emailIsValid === true) return;

    const payload = {
      userEmail: this.userEmail,
    };
    this.subscriber.push(
      this.password
        .forgotPassword(payload)
        .pipe(
          tap((res) => {
            this.dataReceived = true;
            res.includes('Email found')
              ? (this.emailIsValid = true)
              : (this.emailIsValid = false);
          })
        )
        .subscribe()
    );
  }

  submitVerificationCode() {
    if (
      this.dataReceived === false ||
      this.emailIsValid === false ||
      this.isVerificationCodeValid
    )
      return;

    const payload = {
      verificationCode: this.verificationCode,
    };
    this.subscriber.push(
      this.password
        .verifyCode(payload)
        .pipe(
          tap((res) => {
            this.verificationCodeReceived = true;
            res.includes('Verified')
              ? (this.isVerificationCodeValid = true)
              : (this.isVerificationCodeValid = false);
          })
        )
        .subscribe()
    );
  }

  submitNewPassword() {
    if (this.newPassword !== this.verifyNewPassword) {
      this.isVerificationCodeValid &&
        (this.passwordError = 'Passwords do not match');
      return;
    }
    if (this.newPassword.length < 8) {
      this.isVerificationCodeValid &&
        (this.passwordError =
          'Password length should be minimum of 8 characters');
      return;
    }

    const payload = {
      name: 'password',
      password: this.newPassword,
      email: this.userEmail,
    };

    this.subscriber.push(
      this.password
        .createNewPassword(payload)
        .pipe(
          tap((res) => {
            res.includes('Data updated successfully')
              ? this.router.navigateByUrl(ROUTES_URL.LOGIN_URL)
              : (this.passwordError =
                  'Cannot update password, try again later');
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscriber.forEach((item) => item.unsubscribe());
  }
}
