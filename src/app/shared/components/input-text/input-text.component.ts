import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  Output
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormControlName,
  FormGroupDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgForm,
  NgModel,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Utils } from '@/helpers/utils';
import { Password } from 'primeng/password';
import { Constants } from '@/helpers/constants';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'm-text',
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    InputTextModule,
    CommonModule,
    Password,
    IconField,
    InputIcon
  ]
})
export class InputTextComponent implements Validator, ControlValueAccessor, AfterViewInit {
  @Output() onClickIcon = new EventEmitter();
  @Output() onBlur = new EventEmitter();
  @Input() label: string = 'EMPTY';
  @Input() placeholder: string = 'EMPTY';
  @Input() leftIcon: string | null = null;
  @Input() rightIcon: string | null = null;
  @Input() type: 'text' | 'password' | 'email' | 'phone' = 'text';
  @Input() showLabel: boolean = true;
  @Input() required?: boolean | string;
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  control = new FormControl<any>(null);
  ngControl?: NgControl;
  patternEmail: string = Constants.Regex_Email.source;
  patternPhone: string = Constants.Regex_Phone.source;

  constructor(
    private inj: Injector,
    private cdr: ChangeDetectorRef
  ) {
    this.control.valueChanges.subscribe(value => {
      if (this.onChange) {
        this.onChange(value);
      }
    });
  }

  ngAfterViewInit() {
    this.ngControl = this.inj.get(NgControl);
    this.cdr.detectChanges();
  }

  get errors() {
    return (
      (((this.ngControl as NgModel | FormControlName)?.formDirective as NgForm | FormGroupDirective)
        ?.submitted ||
        this.ngControl?.touched ||
        this.ngControl?.dirty) &&
      this.ngControl?.errors &&
      !this.readonly
    );
  }

  //Lấy ra message lỗi validate để hiển thị, nếu có nhiều lỗi -> hiển thị lỗi đầu tiên.
  getError() {
    return Utils.getErrorMessage(this.label, this.ngControl?.errors);
  }

  //Dùng để check trường hiện tại có phải required hay không.
  get checkRequire() {
    return this.ngControl?.control?.hasValidator(Validators.required);
  }

  writeValue(value: string): void {
    this.control.setValue(value, { emitEvent: false });
    if (this.ngControl) {
      this.ngControl?.control?.markAsPristine();
    }
  }

  onChange = (_value: string) => {};

  onTouched = () => {};

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (Utils.isNotEmpty(this.control.value)) {
      switch (this.type) {
        case 'email':
          return !this.control.value.match(this.patternEmail)
            ? { emailPattern: { actualValue: control.value } }
            : null;
        case 'phone':
          return !this.control.value.match(this.patternPhone)
            ? { phonePattern: { actualValue: control.value } }
            : null;
        default:
          return null;
      }
    }
    return null;
  }

  clickIcon() {
    this.onClickIcon.emit();
  }

  inputBlur() {
    this.onBlur.emit();
  }
}
