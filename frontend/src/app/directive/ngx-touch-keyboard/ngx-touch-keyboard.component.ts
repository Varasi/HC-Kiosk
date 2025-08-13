import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  LOCALE_ID,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { fnButton } from './Locale/constants';
import { Locale } from './Locale/type';
import * as Locales from './Locale';

@Component({
  selector: 'ngx-touch-keyboard',
  templateUrl: './ngx-touch-keyboard.component.html',
  styleUrls: ['./ngx-touch-keyboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTouchKeyboardComponent {
  locale: Locale = Locales.enUS;
  layoutMode = 'text';
  layoutName = 'alphabetic';
  debug = false;

  @Output() closePanel = new EventEmitter<void>();

  private _activeButtonClass = 'active';
  private _holdInteractionTimeout!: number;
  private _holdTimeout!: number;
  private _isMouseHold!: boolean;
  private _caretPosition: number | null = null;
  private _caretPositionEnd: number | null = null;
  private _activeInputElement!: HTMLInputElement | HTMLTextAreaElement | null;

  constructor(private _sanitizer: DomSanitizer,
    private _elementRef: ElementRef<HTMLInputElement>,
    @Inject(LOCALE_ID) private _defaultLocale: string) { }

  get maxLength(): number {
    return this._activeInputElement?.maxLength ?? -1;
  }

  get isTextarea(): boolean {
    return this._activeInputElement?.type === 'textarea';
  }

  get isEmail(): boolean {
    return this._activeInputElement?.type === 'email';
  }

  // on keyup
  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    if (event.isTrusted) {
      this._caretEventHandler(event);
      this._handleHighlightKeyUp(event);
    }
  }

  // on keydown
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.isTrusted) {
      this._handleHighlightKeyDown(event);
    }
  }

  // on pointerup (mouseup or touchend)
  @HostListener('window:pointerup', ['$event'])
  handleMouseUp(event: MouseEvent): void {
    this._caretEventHandler(event);
  }

  // on select
  @HostListener('window:select', ['$event'])
  handleSelect(event: Event): void {
    this._caretEventHandler(event);
  }

  // on selectionchange
  @HostListener('window:selectionchange', ['$event'])
  handleSelectionChange(event: Event): void {
    this._caretEventHandler(event);
  }

  // set layout keyboard for locale
  setLocale(value: string = this._defaultLocale): void {
    // normalize value
    value = value.replace('-', '').trim();
    // set Locale if supported
    if ((Object.keys(Locales) as readonly string[]).includes(value)) {
      this.locale = Locales[value as 'enUS'];
    }
    // set default Locale if not supported
    else {
      this.locale = Locales.enUS;
    }
  }

  // set active input
  setActiveInput(input: HTMLInputElement | HTMLTextAreaElement): void {
    this._activeInputElement = input;

    // tracking keyboard layout
    const inputMode = this._activeInputElement?.inputMode;
    if (inputMode &&
      ['text', 'search', 'email', 'url', 'numeric', 'decimal', 'tel'].some((i) => i === inputMode)) {
      this.layoutMode = inputMode;
    } else {
      this.layoutMode = 'text';
    }

    if (
      inputMode &&
      ['numeric', 'decimal', 'tel'].some((i) => i === inputMode)
    ) {
      this.layoutName = 'default';
    } else {
      this.layoutName = 'alphabetic';
    }

    if (this.debug) {
      console.log('Locale:', `${this.locale.code || this._defaultLocale}`);
      console.log('Layout:', `${this.layoutMode}_${this.layoutName}`);
    }

    // must ensure caretPosition doesn't persist once reactivated.
    this._setCaretPosition(
      this._activeInputElement.selectionStart,
      this._activeInputElement.selectionEnd
    );

    if (this.debug) {
      console.log(
        'Caret start at:',
        this._caretPosition,
        this._caretPositionEnd
      );
    }

    // and set focus to input
    this._focusActiveInput();
  }

  // check whether the button is a standard button
  isStandardButton = (button: string) =>
    button && !(button[0] === '{' && button[button.length - 1] === '}');

  // retrieve button type
  getButtonType(button: string): 'standard-key' | 'function-key' {
    return this.isStandardButton(button) ? 'standard-key' : 'function-key';
  }

  // adds default classes to a given button
  getButtonClass(button: string): string {
    const buttonTypeClass = this.getButtonType(button);
    const buttonWithoutBraces = button.replace('{', '').replace('}', '');
    let buttonNormalized = '';

    if (buttonTypeClass !== 'standard-key')
      buttonNormalized = `${buttonWithoutBraces}-key`;

    return `${buttonTypeClass} ${buttonNormalized}`;
  }

  // returns the display (label) name for a given button
  getButtonDisplayName(button: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(
      this.locale.display[button] || button
    );
  }

  // handles clicks made to keyboard buttons
  handleButtonClicked(button: string, e?: Event): void {
    if (this.debug) {
      console.log('Key pressed:', button);
    }

    if (button === fnButton.SHIFT) {
      this.layoutName =
        this.layoutName === 'alphabetic' ? 'shift' : 'alphabetic';
      return;
    } else if (button === fnButton.DONE) {
      this.closePanel.emit();
      return;
    }

    const commonParams: [number, number, boolean] = [
      this._caretPosition || 0,
      this._caretPositionEnd || 0,
      true,
    ];
    let output = this._activeInputElement?.value || '';

    // handel functional button
    if (!this.isStandardButton(button)) {
      // handel BACKSPACE
      if (button === fnButton.BACKSPACE) {
        output = this._removeAt(output, ...commonParams);
      }
      // handel SPACE
      else if (button === fnButton.SPACE) {
        output = this._addStringAt(output, ' ', ...commonParams);
      }
      // handel TAB
      else if (button === fnButton.TAB) {
        output = this._addStringAt(output, '\t', ...commonParams);
      }
      // handel ENTER
      else if (button === fnButton.ENTER) {
        if (this.isTextarea) {
          output = this._addStringAt(output, '\n', ...commonParams);
        }
      }
      // handel LAYOUT
      else {
        this.layoutName = button.substring(1, button.length - 1);
        return;
      }
    }
    // handel standard button
    else {
      output = this._addStringAt(output, button, ...commonParams);
    }

    if (this._activeInputElement) {
      this._activeInputElement.value = output;

      if (this.debug) {
        console.log('Caret at:', this._caretPosition, this._caretPositionEnd, 'Button', e);
      }
    }

    this._dispatchEvents(button);
  }

  // handles button mousedown
  handleButtonMouseDown(button: string, e?: Event): void {
    if (e) {
      // handle event options
      e.preventDefault();
      e.stopPropagation();
    }

    // add active class
    this._setActiveButton(button);

    if (this._holdInteractionTimeout)
      clearTimeout(this._holdInteractionTimeout);
    if (this._holdTimeout) clearTimeout(this._holdTimeout);
    this._isMouseHold = true;

    // time to wait until a key hold is detected
    this._holdTimeout = window.setTimeout(() => {
      if (
        this._isMouseHold &&
        ((!button.includes('{') && !button.includes('}')) ||
          button === fnButton.BACKSPACE ||
          button === fnButton.SPACE)
      ) {
        if (this.debug) {
          console.log('Button held:', button);
        }
        this.handleButtonHold(button);
      }
      clearTimeout(this._holdTimeout);
    }, 500);
  }

  // handles button mouseup
  handleButtonMouseUp(button: string, e?: Event): void {
    if (e) {
      // handle event options
      e.preventDefault();
      e.stopPropagation();
    }

    // remove active class
    this._removeActiveButton();

    this._isMouseHold = false;
    if (this._holdInteractionTimeout)
      clearTimeout(this._holdInteractionTimeout);
  }

  // handles button hold
  handleButtonHold(button: string): void {
    if (this._holdInteractionTimeout)
      clearTimeout(this._holdInteractionTimeout);

    // timeout dictating the speed of key hold iterations
    this._holdInteractionTimeout = window.setTimeout(() => {
      if (this._isMouseHold) {
        this.handleButtonClicked(button);
        this.handleButtonHold(button);
      } else {
        clearTimeout(this._holdInteractionTimeout);
      }
    }, 100);
  }

  // changes the internal caret position
  private _setCaretPosition(
    position: number | null,
    endPosition = position
  ): void {
    this._caretPosition = position;
    this._caretPositionEnd = endPosition;
  }

  // moves the cursor position by a given amount
  private _updateCaretPos(length: number, minus = false) {
    const newCaretPos = this._updateCaretPosAction(length, minus);
    this._setCaretPosition(newCaretPos);
    
    // scroll to bottom
    setTimeout(() => {
      this._activeInputElement?.scrollTo({
        top: this._activeInputElement.scrollHeight,
      } as ScrollToOptions);
    });
  }

  // action method of updateCaretPos
  private _updateCaretPosAction(length: number, minus = false) {
    let caretPosition = this._caretPosition;

    if (caretPosition != null) {
      if (minus) {
        if (caretPosition > 0) caretPosition = caretPosition - length;
      } else {
        caretPosition = caretPosition + length;
      }
    }

    return caretPosition;
  }

  // removes an amount of characters before a given position
  private _removeAt(
    source: string,
    position = source.length,
    positionEnd = source.length,
    moveCaret = false
  ) {
    if (position === 0 && positionEnd === 0) {
      return source;
    }

    let output;

    if (position === positionEnd) {
      let prevTwoChars;
      let emojiMatched;
      const emojiMatchedReg = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g;

      /**
       * Emojis are made out of two characters, so we must take a custom approach to trim them.
       * For more info: https://mathiasbynens.be/notes/javascript-unicode
       */
      if (position && position >= 0) {
        prevTwoChars = source.substring(position - 2, position);
        emojiMatched = prevTwoChars.match(emojiMatchedReg);

        if (emojiMatched) {
          output = source.substr(0, position - 2) + source.substr(position);
          if (moveCaret) this._updateCaretPos(2, true);
        } else {
          output = source.substr(0, position - 1) + source.substr(position);
          if (moveCaret) this._updateCaretPos(1, true);
        }
      } else {
        prevTwoChars = source.slice(-2);
        emojiMatched = prevTwoChars.match(emojiMatchedReg);

        if (emojiMatched) {
          output = source.slice(0, -2);
          if (moveCaret) this._updateCaretPos(2, true);
        } else {
          output = source.slice(0, -1);
          if (moveCaret) this._updateCaretPos(1, true);
        }
      }
    } else {
      output = source.slice(0, position) + source.slice(positionEnd);
      if (moveCaret) {
        this._setCaretPosition(position);
      }
    }

    return output;
  }

  // adds a string to the input at a given position
  private _addStringAt(
    source: string,
    str: string,
    position = source.length,
    positionEnd = source.length,
    moveCaret = false
  ) {
    if (this.maxLength !== -1 && source.length >= this.maxLength) {
      return source;
    }

    let output;

    if (!position && position !== 0) {
      output = source + str;
    } else {
      output = [source.slice(0, position), str, source.slice(positionEnd)].join(
        ''
      );
      if (moveCaret) this._updateCaretPos(str.length, false);
    }

    return output;
  }

  // method to dispatch necessary keyboard events to current input element.
  private _dispatchEvents(button: string) {
    let key, code;
    if (button.includes('{') && button.includes('}')) {
      // Capitalize name
      key = button.slice(1, button.length - 1).toLowerCase();
      key = key.charAt(0).toUpperCase() + key.slice(1);
      code = key;
    } else {
      key = button;
      code = Number.isInteger(Number(button))
        ? `Digit${button}`
        : `Key${button.toUpperCase()}`;
    }

    const eventInit: KeyboardEventInit = {
      bubbles: true,
      cancelable: true,
      shiftKey: this.layoutName == 'shift',
      key: key,
      code: code,
      location: 0,
    };

    // simulate all needed events on base element
    this._activeInputElement?.dispatchEvent(
      new KeyboardEvent('keydown', eventInit)
    );
    this._activeInputElement?.dispatchEvent(
      new KeyboardEvent('keypress', eventInit)
    );
    this._activeInputElement?.dispatchEvent(
      new Event('input', { bubbles: true })
    );
    this._activeInputElement?.dispatchEvent(
      new KeyboardEvent('keyup', eventInit)
    );

    // and set focus to input
    this._focusActiveInput();
  }

  // called when an event that warrants a cursor position update is triggered
  private _caretEventHandler(event: any) {
    let targetTagName = '';
    if (event.target.tagName) {
      targetTagName = event.target.tagName.toLowerCase();
    }

    const isTextInput =
      targetTagName === 'textarea' ||
      (targetTagName === 'input' &&
        ['text', 'search', 'email', 'password', 'url', 'tel'].includes(
          event.target.type
        ));

    const isKeyboard =
      event.target === this._elementRef.nativeElement ||
      (event.target && this._elementRef.nativeElement.contains(event.target));

    if (isTextInput && this._activeInputElement == event.target) {
      // tracks current cursor position
      // as keys are pressed, text will be added/removed at that position within the input.
      this._setCaretPosition(
        event.target.selectionStart,
        event.target.selectionEnd
      );

      if (this.debug) {
        console.log(
          'Caret at:',
          this._caretPosition,
          this._caretPositionEnd,
          event && event.target.tagName.toLowerCase(),
          event
        );
      }
    } else if (
      event.type === 'pointerup' &&
      this._activeInputElement === document.activeElement
    ) {
      if (this._isMouseHold) {
        this.handleButtonMouseUp('');
      }
      return;
    } else if (!isKeyboard && event?.type !== 'selectionchange') {
      // must ensure caretPosition doesn't persist once reactivated.
      this._setCaretPosition(null);

      if (this.debug) {
        console.log(
          `Caret position reset due to "${event?.type}" event`,
          event
        );
      }

      // close panel
      this.closePanel.emit();
    }
  }

  // focus to input
  private _focusActiveInput(): void {
    this._activeInputElement?.focus();

    if (!this.isEmail) {
      this._activeInputElement?.setSelectionRange(
        this._caretPosition,
        this._caretPositionEnd
      );
    }
  }

  // handel highlight on key down
  private _handleHighlightKeyDown(event: KeyboardEvent): void {
    const buttonPressed = this._getKeyboardLayoutKey(event);
    // add active class
    this._setActiveButton(buttonPressed);
  }

  // handel highlight on key up
  private _handleHighlightKeyUp(event: KeyboardEvent): void {
    const buttonPressed = this._getKeyboardLayoutKey(event);
    // remove active class
    this._removeActiveButton(buttonPressed);
  }

  // transforms a KeyboardEvent's "key.code" string into a virtual-keyboard layout format
  private _getKeyboardLayoutKey(event: KeyboardEvent) {
    let output = '';
    const keyId = event.code || event.key;

    if (
      keyId?.includes('Space') ||
      keyId?.includes('Numpad') ||
      keyId?.includes('Backspace') ||
      keyId?.includes('CapsLock') ||
      keyId?.includes('Meta')
    ) {
      output = `{${event.code}}` || '';
    } else if (
      keyId?.includes('Control') ||
      keyId?.includes('Shift') ||
      keyId?.includes('Alt')
    ) {
      output = `{${event.key}}` || '';
    } else {
      output = event.key || '';
    }

    return output.length > 1 ? output?.toLowerCase() : output;
  }

  // set active class in button
  private _setActiveButton(buttonName: string): void {
    const node = this._elementRef.nativeElement
      .getElementsByTagName('button')
      .namedItem(buttonName);
    if (node && node.classList) {
      node.classList.add(this._activeButtonClass);
    }
  }

  // remove active button
  private _removeActiveButton(buttonName?: string): void {
    const nodes = this._elementRef.nativeElement.getElementsByTagName('button');
    if (buttonName) {
      const node = nodes.namedItem(buttonName);
      if (node && node.classList) {
        node.classList.remove(this._activeButtonClass);
      }
    } else {
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].classList.remove(this._activeButtonClass);
      }
    }
  }
}
