import {
  ComponentRef,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ComponentPortal } from '@angular/cdk/portal';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Overlay,
  OverlayRef,
  OverlaySizeConfig,
  PositionStrategy
} from '@angular/cdk/overlay';

import { NgxTouchKeyboardComponent } from './ngx-touch-keyboard.component';

@Directive({
  selector: 'input[ngxTouchKeyboard], textarea[ngxTouchKeyboard]',
  exportAs: 'ngxTouchKeyboard'
})
export class NgxTouchKeyboardDirective implements OnDestroy {
  isOpen = false;

  private _locale!: string;
  private _debugMode!: boolean;
  private _fullScreenMode!: boolean;
  private _overlayRef!: OverlayRef;
  private _panelRef!: ComponentRef<NgxTouchKeyboardComponent>;
  
  @Input()
  get ngxTouchKeyboard() { return this._locale; }
  set ngxTouchKeyboard(value: string) { this._locale = value; }

  @Input()
  get ngxTouchKeyboardDebug() { return this._debugMode; }
  set ngxTouchKeyboardDebug(value: any) { this._debugMode = coerceBooleanProperty(value); }

  @Input()
  get ngxTouchKeyboardFullScreen() { return this._fullScreenMode; }
  set ngxTouchKeyboardFullScreen(value: any) { this._fullScreenMode = coerceBooleanProperty(value); }

  constructor(
    private _overlay: Overlay,
    private _elementRef: ElementRef<HTMLInputElement>,
    @Inject(DOCUMENT) private _document: any) { }

  ngOnDestroy(): void {
    // dispose the overlay
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  // open keyboard panel
  openPanel(): void {
    // return if panel is attached
    if (this._overlayRef?.hasAttached()) {
      return;
    }

    // create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
    }

    // set overlay class
    this._overlayRef.addPanelClass('ngx-touch-keyboard-overlay-pane');

    if (this.ngxTouchKeyboardFullScreen)
      this._overlayRef.addPanelClass('ngx-touch-keyboard-fullScreen');

    // update direction the overlay
    this._overlayRef.setDirection(
      this._document.body.getAttribute('dir') || this._document.dir || 'ltr'
    );

    // update position the overlay
    this._overlayRef.updatePositionStrategy(
      this._getPositionStrategy(this.ngxTouchKeyboardFullScreen)
    );

    // update size the overlay
    this._overlayRef.updateSize(
      this._getOverlaySize(this.ngxTouchKeyboardFullScreen)
    );

    // attach the portal to the overlay
    this._panelRef = this._overlayRef.attach(
      new ComponentPortal(NgxTouchKeyboardComponent)
    );
    
    this._panelRef.instance.debug = this.ngxTouchKeyboardDebug;
    this._panelRef.instance.setLocale(this._locale);
    this._panelRef.instance.setActiveInput(this._elementRef.nativeElement);

    this.isOpen = true;

    // reference the input element // LB
    // this._panelRef.instance.closePanel.subscribe(() => this.closePanel());
  }

  // close keyboard panel
  closePanel(): void {
   this._overlayRef.detach();
   this.isOpen = false;
  }

  // toggle keyboard panel
  togglePanel(): void {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private _createOverlay(): void {
    this._overlayRef = this._overlay.create({
      hasBackdrop: false,
      scrollStrategy: this._overlay.scrollStrategies.noop()
    });
  }

  private _getPositionStrategy(fullscreen: boolean): PositionStrategy {
    if (fullscreen) {
      return this._overlay.position().global().centerHorizontally().bottom('0');
    }

    return this._overlay
      .position()
      .flexibleConnectedTo(this._inputOrigin())
      .withLockedPosition(true)
      .withPush(true)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
        },
      ]);
  }

  private _getOverlaySize(fullscreen: boolean): OverlaySizeConfig {
    if (fullscreen) {
      return {
        width: '100%',
        maxWidth: '100%',
        minWidth: '100%',
      };
    }

    return {
      width: this._inputOrigin().getBoundingClientRect().width,
      maxWidth: this._inputOrigin().getBoundingClientRect().width,
      minWidth: '260px',
    };
  }

  private _inputOrigin(): any {
    return this._elementRef.nativeElement;
  }
}
