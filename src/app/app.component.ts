import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAccess } from './services/login-service/login.service';
import { INITIAL_LOADING_TIME } from './settings/app.settings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'eServices';
  timeOut: boolean = false;
  showHeaderFooter$: Observable<boolean>;
  
  constructor(private userAccess: UserAccess) {}

  ngOnInit()
  {
    setTimeout(() => {
      this.timeOut = true;
    }, INITIAL_LOADING_TIME);

   this.showHeaderFooter$ = this.userAccess.getHeaderFooter();
  }

}
