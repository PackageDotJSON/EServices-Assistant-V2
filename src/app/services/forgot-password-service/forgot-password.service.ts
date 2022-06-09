import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "src/app/constants/base-url.constant";
import { LOGIN_API } from "src/app/enums/apis.enum";

@Injectable()

export class ForgotPasswordService {
    
    constructor(private http: HttpClient){}
    
    forgotPassword(payload): Observable<any> {
        if(!sessionStorage.token) {
            sessionStorage.setItem('token', 'abc');
        }
        return this.http.post(BASE_URL + LOGIN_API.FORGOT_PASSWORD_API, payload, {responseType: 'text'});
    }
}