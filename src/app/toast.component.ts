import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastService, ToastMessage } from './core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone:true,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports:[CommonModule]
})
// import { ChangeDetectorRef } from '@angular/core';

export class ToastComponent implements OnInit {
  toast: ToastMessage | null = null;

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.toastService.toastState.subscribe((toast: ToastMessage) => {
      this.toast = toast;
      this.cdr.detectChanges(); // Manually trigger change detection
      setTimeout(() => {
        this.toast = null; // Hide the toast after 3 seconds
        this.cdr.detectChanges(); // Re-trigger change detection
      }, 5000);
    });
  }
}
