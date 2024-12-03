import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[alphabetOnly]',
  standalone: true
})
export class AlphabetOnlyDirective {
  @HostListener('input', ['$event'])
  onInputChange(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^a-zA-Z]*/g, '');

    input.value = sanitized;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    input.value = '';
  }
}
