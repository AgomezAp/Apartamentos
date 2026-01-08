import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumberOnly]',
  standalone: true
})
export class NumberOnlyDirective {
  @Input() allowDecimals: boolean = false;
  @Input() allowNegative: boolean = false;

  private specialKeys: Array<string> = [
    'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
  ];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow special keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);

    // Allow negative sign at the beginning
    if (this.allowNegative && event.key === '-' && current.length === 0) {
      return;
    }

    // Allow decimal point
    if (this.allowDecimals && event.key === '.' && current.indexOf('.') === -1) {
      return;
    }

    // Check if the result is a valid number
    if (event.key && !String(next).match(/^-?\d*\.?\d*$/)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedInput: string = event.clipboardData?.getData('text/plain') || '';
    const regex = this.allowDecimals ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
    
    if (regex.test(pastedInput)) {
      document.execCommand('insertText', false, pastedInput);
    }
  }
}
