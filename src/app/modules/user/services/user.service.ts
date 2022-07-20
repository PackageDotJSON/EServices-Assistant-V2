import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import {
  ESERVICES_MANAGEMENT_API,
  REQUEST_LOG_API,
} from 'src/app/enums/apis.enum';
import { RequestLog } from 'src/app/modules/user/models/requestlog.model';
import { EServicesModel } from '../models/eservices.model';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  getLogRequests() {
    return this.http.get(
      BASE_URL + REQUEST_LOG_API.GET_LOG_REQUESTS
    ) as Observable<RequestLog>;
  }

  postLogRequest(email: string, message: string): Observable<any> {
    const payload = {
      email,
      message,
    };
    return this.http.post(
      BASE_URL + REQUEST_LOG_API.POST_LOG_REQUESTS,
      payload,
      { responseType: 'text' }
    );
  }

  deleteLogRequest(email: string, message: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('message', message);
    return this.http.delete(BASE_URL + REQUEST_LOG_API.DELETE_LOG_REQUESTS, {
      params,
    });
  }

  fetchEServicesData() {
    return this.http.get(
      BASE_URL + ESERVICES_MANAGEMENT_API.GET_DATA
    ) as Observable<any>;
  }

  searchEServicesData(key: string) {
    const params = new HttpParams().set('id', key);
    return this.http.get(BASE_URL + ESERVICES_MANAGEMENT_API.SEARCH_DATA, {
      params,
    }) as Observable<any>;
  }

  postEServicesData(data: EServicesModel) {
    return this.http.post(BASE_URL + ESERVICES_MANAGEMENT_API.POST_DATA, data, {
      responseType: 'text',
    }) as Observable<any>;
  }
}
