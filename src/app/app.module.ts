import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { RouterModule} from "@angular/router";
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { HelpComponent } from './pages/help/help.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { ROUTES } from './routes/routes';

import { HeaderService } from './services/header-service/header.service';
import { UserAccess } from "./services/login-service/login.service";
import { AuthGuard } from "./services/guards/auth.guard";
import { HeaderInterceptor } from "./services/interceptor/http.interceptor";


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingPageComponent,
    HelpComponent,
    LogoutComponent,
    HeaderComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [UserAccess, HeaderService, AuthGuard, {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
