import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()

export class UserAccess
{
  isHeaderFooterVisible$ = new BehaviorSubject<boolean>(false);
  accessTypeFull: boolean = false;
  accessTypePartial: boolean = false;
  accessTypeMinimum: boolean = false;

  fullUserAccess()
  {
      this.accessTypeFull = true;
  }

  partialUserAccess()
  {
      this.accessTypePartial = true;
  }

  minimumUserAccess()
  {
      this.accessTypeMinimum = true;
  }

  displayHeaderFooter(value: boolean) {
    this.isHeaderFooterVisible$.next(value);
  }

  getHeaderFooter() {
      return this.isHeaderFooterVisible$;
  }

}
