// service to manage the timeout timers and dialog box

import { Injectable } from '@angular/core';
import { TicketService } from './app.ticketservice.service';

@Injectable({
  providedIn: 'root'
})
export class TimeoutService {

  constructor(
    public ticketService: TicketService,
  ) { }

  // arrays of active intervals and timeouts
  public intervalIds: number[] = [];
  public timeoutIds: number[] = [];

  // clears an interval by ID, then removes it from the active intervals list
  clearInterval(intervalId: number): void {
    clearInterval(intervalId);
    this.intervalIds = this.intervalIds.filter(id => id !== intervalId);
  }

  // clears an timeout by ID, then removes it from the active timeouts list
  clearTimeout(timeoutId: number): void {
    clearTimeout(timeoutId);
    this.timeoutIds = this.timeoutIds.filter(id => id !== timeoutId);
  }

  // clears all intervals and timeouts in the arrays
  clearAllTimers(): void {
    this.intervalIds.forEach(id => this.clearInterval(id));
    this.timeoutIds.forEach(id => this.clearTimeout(id));
  }
}
