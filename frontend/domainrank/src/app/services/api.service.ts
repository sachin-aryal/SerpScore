import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import {AuthGuardService} from './auth-guard.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  basePath = 'http://localhost:8000';

  public getApiUrl(api: string) {
    const urlMapping = {
      GET_TOKEN: '/api/get_api_token',
      REFRESH_TOKEN: '/api/refresh_api_token',
      LIST_CONFIG: '/api/list_config/',
      CREATE_CONFIG: '/api/create_config/',
      CREATE_CREDENTIALS: '/api/create_credentials/',
      GET_CREDENTIALS: '/api/get_credentials/',
      EXTRACT_CONFIG: '/api/get_config/',
      GET_RANK: '/api/get_rank/',
      DOWNLOAD_DOMAIN_REPORT: '/api/download_domain_report/',
      RANK_DATA: '/api/drill_rank_data/',
      DELETE_DOMAIN: '/api/delete_domain/'
    };
    return this.basePath + urlMapping[api];
  }

  constructor(private http: HttpClient) { }

  // Handle API errors
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
      msg = error.error.message;
    } else {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('currentUser');
        msg = 'The request is not authorized.';
      } else {
        if (error.status === 0) {
          msg = 'Server is not reachable. Try again later';
        } else {
          msg = error.error;
        }
      }
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    const data = `Error: ${msg}; status code: ${error.status}`;
    // return an observable with a user-facing error message
    return throwError(JSON.stringify((data)));
  }

  downloadFile(params, endpoint) {
    let headers: HttpHeaders = new HttpHeaders();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      headers = headers.append('Authorization', 'Bearer ' + user.token);
    }
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers
    };
    return this.http.post(this.getApiUrl(endpoint), params, httpOptions);
  }

  post(params, endpoint): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      headers = headers.append('Authorization', 'Bearer ' + user.token);
    }
    return this.http.post<any>(
      this.getApiUrl(endpoint),
      params,
      { headers }
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

}
