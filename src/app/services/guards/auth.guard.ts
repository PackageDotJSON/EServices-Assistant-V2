import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import {UserAccess} from '../login-service/login.service'

@Injectable()
export class AuthGuard implements CanActivate
{
  constructor(private auth: UserAccess, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean
  {
    if((this.auth.accessTypeFull == true) || (this.auth.accessTypePartial == true) || (this.auth.accessTypeMinimum == true))
    {
      return true;
    }

    return false;
  }
}
