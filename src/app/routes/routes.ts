import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { LogoutComponent } from '../pages/logout/logout.component';
import { HelpComponent } from '../pages/help/help.component';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { AuthGuard } from '../services/guards/auth.guard';

export const ROUTES: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'companylogs',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('../modules/company-logs/company-logs.module').then(
        (m) => m.CompanyLogsModule
      ),
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    loadChildren: () => 
      import('../modules/user/user.module').then(
        (m) => m.UserModule
      ),
  },
  { path: 'home', canActivate: [AuthGuard], component: LandingPageComponent },
  { path: 'help', canActivate: [AuthGuard], component: HelpComponent },
  { path: 'logout', canActivate: [AuthGuard], component: LogoutComponent }
];
