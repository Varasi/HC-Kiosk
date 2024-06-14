import { Injectable } from "@angular/core";

import { MessageService } from "primeng/api";

@Injectable()
export class AppNotificationService {
  constructor(private messageService: MessageService) { }

  public notifySuccess(message: string, detail?: string) {
    this.messageService.add({ severity: 'success', summary: message, detail: detail });
  }

  public notifyError(message: string, detail?: string) {
    this.messageService.add({ severity: 'error', summary: message, detail: detail });
  }

  public notifyWarning(message: string, detail?: string) {
    this.messageService.add({ severity: 'warn', summary: message, detail: detail });
  }

  public notifyInfo(message: string, detail?: string) {
    this.messageService.add({ severity: 'info', summary: message, detail: detail });
  }

  public clear() {
    this.messageService.clear();
  }
}
