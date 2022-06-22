import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RequestLogService } from './services/request-log.service';

import { AdminpanelComponent } from './admin-panel/admin-panel.component';
import { UserprofileComponent } from './user-profile/user-profile.component';
import { RequestlogComponent } from './request-log/request-log.component';

const ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'admin', component: AdminpanelComponent },
      { path: 'profile', component: UserprofileComponent },
      { path: 'requestlog', component: RequestlogComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminpanelComponent,
    UserprofileComponent,
    RequestlogComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(ROUTES)],
  providers: [RequestLogService],
})
export class UserModule {}
