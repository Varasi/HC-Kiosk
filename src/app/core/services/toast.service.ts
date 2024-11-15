import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warn';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toastState = this.toastSubject.asObservable();

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warn' = 'info') {
    console.log('in service',message,type);
    this.toastSubject.next({ message, type });
  }
}