import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ROUTES } from './routes/routes.constant';

import { UserService } from './services/user.service';

import { ApplicationManagementComponent } from './role-management/application-management/application-management.component';
import { EservicesManagementComponent } from './role-management/eservices-management/eservices-management.component';
import { UserprofileComponent } from './user-profile/user-profile.component';
import { RequestlogComponent } from './request-log/request-log.component';

@NgModule({
  declarations: [
    ApplicationManagementComponent,
    EservicesManagementComponent,
    UserprofileComponent,
    RequestlogComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(ROUTES)],
  providers: [UserService],
})
export class UserModule {}
