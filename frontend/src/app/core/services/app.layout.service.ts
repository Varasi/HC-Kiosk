import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone } from '@angular/core';

import { Subject } from 'rxjs';
import { LocalStorageItems } from 'src/app/shared/models';

export type MenuMode = 'static' | 'overlay' | 'horizontal' | 'slim' | 'slim-plus' | 'reveal' | 'drawer';
export type ColorScheme = 'light' | 'dark';

export interface AppConfig {
    inputStyle: string;
    colorScheme: ColorScheme;
    componentTheme: string;
    ripple: boolean;
    menuMode: MenuMode;
    scale: number;
    theme: string;
    menuTheme: string;
    topbarTheme: string;
    menuProfilePosition: string;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
    rightMenuActive: boolean;
    topbarMenuActive: boolean;
    menuProfileActive: boolean;
    sidebarActive: boolean;
    anchored: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AppLayoutService {
    dark = true;
    audio = true;
    themeChanged = new Subject<string>();

    config: AppConfig = {
        ripple: true,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        componentTheme: 'indigo',
        theme: 'theme-light',
        scale: 14,
        menuTheme: 'light',
        topbarTheme: 'light',
        menuProfilePosition: 'end'
    };

    state: LayoutState = {
        staticMenuDesktopInactive: true,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        rightMenuActive: false,
        topbarMenuActive: false,
        menuProfileActive: false,
        sidebarActive: false,
        anchored: false
    };

    private configUpdate = new Subject<AppConfig>();
    private overlayOpen = new Subject<any>();
    private topbarMenuOpen = new Subject<any>();
    private menuProfileOpen = new Subject<any>();

    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();
    topbarMenuOpen$ = this.topbarMenuOpen.asObservable();
    menuProfileOpen$ = this.menuProfileOpen.asObservable();

    constructor(private _ngZone: NgZone, @Inject(DOCUMENT) private _document: any) { }

    onConfigUpdate() {
        this.configUpdate.next(this.config);
    }

    changeAudio(audio: boolean) {
        localStorage.setItem(LocalStorageItems.audio, JSON.stringify(audio));
    }

    changeTheme(colorScheme: ColorScheme) {
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const themeLinkHref = themeLink.getAttribute('href');
        const currentColorScheme = 'theme-' + this.config.colorScheme;
        const newColorScheme = 'theme-' + colorScheme;
        const newHref = themeLinkHref!.replace(currentColorScheme, newColorScheme);

        this.replaceThemeLink(newHref, () => {
            this.config.colorScheme = colorScheme;
            this.config.theme = "theme-" + colorScheme;

            if (colorScheme === 'dark') {
                this.config.menuTheme = 'dark';
                this._updateScheme('dark');
            } else {
                this._updateScheme('light');
            }

            this.onConfigUpdate();
        });
    }

    setDarkTheme() {
        let mode: ColorScheme = 'dark';
        this.dark = true;
        this.saveTheme(mode);
    }

    setTheme() {
        let mode: ColorScheme = 'light';
        if (localStorage.getItem(LocalStorageItems.dark)) {
            this.dark = (localStorage.getItem(LocalStorageItems.dark) === 'true');
        }

        if (this.dark) {
            mode = 'dark';
        }

        this.saveTheme(mode);
    }

    private replaceThemeLink(href: string, onComplete: Function) {
        localStorage.setItem(LocalStorageItems.dark, JSON.stringify(this.dark));

        const id = 'theme-css';
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            themeLink.remove();
            cloneLinkElement.setAttribute('id', id);
            onComplete();
        });
    }

    private saveTheme(mode: ColorScheme) {
        localStorage.setItem(LocalStorageItems.dark, JSON.stringify(this.dark));

        this.themeChanged.next(mode);

        this._ngZone.runOutsideAngular(() => {
            this._ngZone.run(() => {
                this.changeTheme(mode);
            });
        });
    }

    private _updateScheme(scheme: 'light' | 'dark'): void {
        this._document.body.classList.remove('light', 'dark');
        this._document.body.classList.add(scheme);
    }
}
