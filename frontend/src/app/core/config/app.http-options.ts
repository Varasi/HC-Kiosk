import { HttpHeaders, HttpParams } from '@angular/common/http';

export class AppHttpOptions {
  headers?: HttpHeaders;
  observe: 'body' | undefined;
  responseType: 'json' | undefined;
  params?: HttpParams;
}
