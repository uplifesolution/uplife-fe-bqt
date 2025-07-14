import {
  AfterViewInit,
  Directive,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { FormControlName, FormGroupDirective, NgControl, NgForm, NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[validationError]',
  standalone: true
})
export class ValidationErrorDirective implements OnDestroy, AfterViewInit {
  @Input('validationError') customMessages: { [key: string]: string } = {};

  private errorContainer: HTMLElement | null = null;
  private statusSubscription: Subscription | undefined;
  private langSubscription: Subscription | undefined;
  private control!: NgControl;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private injector: Injector
  ) {}

  ngAfterViewInit() {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (ngControl) {
      setTimeout(() => {
        this.control = ngControl;

        // Tạo container cho thông báo lỗi
        this.errorContainer = this.renderer.createElement('small');
        this.renderer.addClass(this.errorContainer, 'p-error');
        this.renderer.setStyle(this.errorContainer, 'display', 'none');
        this.renderer.setStyle(this.errorContainer, 'margin-top', '4px');
        this.renderer.appendChild(this.el.nativeElement.parentNode, this.errorContainer);

        // Lắng nghe thay đổi trạng thái control
        this.statusSubscription = this.control.statusChanges?.subscribe(() => {
          this.updateErrorMessage();
        });

        this.renderer.listen(this.el.nativeElement, 'blur', () => {
          this.updateErrorMessage();
        });

        // Lắng nghe thay đổi ngôn ngữ
        this.langSubscription = this.translate.onLangChange.subscribe(() => {
          this.updateErrorMessage();
        });

        this.updateErrorMessage();
      });
    }
  }

  ngOnDestroy() {
    this.statusSubscription?.unsubscribe();
    this.langSubscription?.unsubscribe();
    if (this.errorContainer) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.errorContainer);
    }
  }

  private updateErrorMessage() {
    const control = this.control.control;
    if (!control || !this.errorContainer) return;

    if (
      ((this.control as NgModel | FormControlName)?.formDirective as NgForm | FormGroupDirective)
        ?.submitted &&
      (control.touched || control.dirty) &&
      control.invalid
    ) {
      const errors = control.errors;
      if (errors) {
        const errorKey = Object.keys(errors)[0];
        this.getErrorMessage(errorKey, errors[errorKey]).then(message => {
          this.showErrorMessage(message);
        });
      }
    } else {
      this.hideErrorMessage();
    }
  }

  private async getErrorMessage(errorKey: string, errorValue: any): Promise<string> {
    // Lấy thông báo từ file dịch
    const translationKey = `validateError.${errorKey}`;
    return await this.translate.get(translationKey, errorValue).toPromise();
  }

  private showErrorMessage(message: string) {
    const safeMessage = this.sanitizer.sanitize(1, message);
    this.renderer.setProperty(this.errorContainer, 'innerHTML', safeMessage);
    this.renderer.setStyle(this.errorContainer, 'display', 'block');
  }

  private hideErrorMessage() {
    this.renderer.setStyle(this.errorContainer, 'display', 'none');
  }
}
