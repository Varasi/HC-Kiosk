import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'daytime' })
export class DayTimePipe implements PipeTransform {
  transform(value: any, position: any) {
    const unknown = 'Unknown';
    if (value == null) {
      return unknown;
    }

    const dayTime = value.split(' ');

    if (position === 0) {
      const day = dayTime[0] ?? unknown;
      return day;
    } else {
      const time = dayTime[1] ?? unknown;
      return time;
    }
  }
}
