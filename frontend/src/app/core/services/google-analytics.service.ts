import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment'; 

declare let gtag: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor(private _router: Router) {
    // send a page view after each successful page change
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      gtag('js', new Date());
      // set up data collection
      gtag('config', environment.ga_tag_id);
    });
  }

  init() {
    // add tracking script to html head
    const script = document.createElement('script');
    script.src = environment.google_tag_mgr;
    script.async = true;
    document.getElementsByTagName('head')[0].appendChild(script);
    const gtagEl = document.createElement('script');
    const gtagBody = document.createTextNode(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
    `);
    gtagEl.appendChild(gtagBody);
    document.body.appendChild(gtagEl);
  }

  // log a page view
  gaPageView(pageTitle: string) {
    let timestamp = Date.now();
    gtag('event', 'page_view', {
      page_title: pageTitle,
      time: timestamp 
    }) 
  }
}
