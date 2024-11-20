import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RuntimeConfigService {
  private config: { [key: string]: any } = {};

  set(key: string, value: any): void {
    this.config[key] = value;
  }

  get(key: string): any {
    return this.config[key];
  }

  getAll(): { [key: string]: any } {
    return this.config;
  }
}
