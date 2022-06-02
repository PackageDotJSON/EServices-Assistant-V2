import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RequestLogService } from './services/request-log.service';

import { AdminpanelComponent } from './adminpanel/adminpanel.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { RequestlogComponent } from './requestlog/requestlog.component';

const ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'admin', component: AdminpanelComponent },
      { path: 'profile', component: UserprofileComponent },
      { path: 'requestlog', component: RequestlogComponent}
    ],
  },
];

@NgModule({
  declarations: [AdminpanelComponent, UserprofileComponent, RequestlogComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(ROUTES)],
  providers: [RequestLogService]
})
export class UserModule {}
