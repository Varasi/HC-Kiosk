import { Injectable } from '@angular/core';
import {
    HttpEvent, 
    HttpInterceptor, 
    HttpHandler, 
    HttpRequest, 
    HttpSentEvent, 
    HttpHeaderResponse,
    HttpProgressEvent, 
    HttpResponse, 
    HttpUserEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LocalStorageItems } from 'src/app/shared/models/local-storage-items.model';

@Injectable({
    providedIn: 'root'
})
export class AppInterceptorService implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler):
        Observable<HttpEvent<any>
            | HttpSentEvent
            | HttpHeaderResponse
            | HttpProgressEvent
            | HttpResponse<any>
            | HttpUserEvent<any>
            | any> {
        return next.handle(request).pipe(
            catchError(error => {
                console.log(error);

                let err: string | undefined = "";
                if (error.error) {
                    if (error.error.error_description) {
                        err = error.error.error_description;
                    } else if (error.error.exceptionMessage) {
                        err = error.error.exceptionMessage;
                    } else if (error.error.message) {
                        err = error.error.message;
                    } else if(error.statusText) {
                        err = error.statusText;
                    }
                } else if(error.statusText) {
                    err = error.statusText;
                }

                if (error.status === 401) {
                    localStorage.removeItem(LocalStorageItems.authData);
                    this.router.navigate(['/login'], { replaceUrl: true });
                }

                if (error instanceof HttpErrorResponse && error.error instanceof Blob && error.error.type === "text/plain") {
                    // https://github.com/angular/angular/issues/19888
                    // When request of type Blob, the error is also in Blob instead of object of the json data
                    return new Promise<any>((resolve, reject) => {
                        let reader = new FileReader();
                        reader.onload = (e: Event) => {
                            try {
                                const errmsg = (<any>e.target).result;
                                reject(new HttpErrorResponse({
                                    error: errmsg,
                                    headers: error.headers,
                                    status: error.status,
                                    statusText: error.statusText,
                                    url: error.url
                                }));
                            } catch (e) {
                                reject(err);
                            }
                        };
                        reader.onerror = (e) => {
                            reject(err);
                        };
                        reader.readAsText(error.error);
                    });
                }

                if (!err) { err = 'Server error'; }
                return throwError(() => new Error(err));
            })
        ) as any;
    }
}
