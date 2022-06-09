import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { tap } from 'rxjs/operators';
import { ForgotPasswordService } from 'src/app/services/forgot-password-service/forgot-password.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
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

export class ForgotPasswordComponent implements OnInit, OnDestroy {
  userEmail: string;
  emailIsValid = false;
  dataReceived = false;
  subscriber: Subscription[] = [];
  verificationCode: number;

  constructor(private password: ForgotPasswordService) { }

  ngOnInit(): void {}

  onForgotPasswordSubmit() {
    const payload = {
      userEmail: this.userEmail
    }
    this.subscriber.push(this.password.forgotPassword(payload).pipe(tap(res => {
      this.dataReceived = true;
      res.includes('Email found') ? this.emailIsValid = true: this.emailIsValid = false;
      console.log(this.emailIsValid, this.dataReceived);
    })).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscriber.forEach(item => item.unsubscribe());
  }

}
