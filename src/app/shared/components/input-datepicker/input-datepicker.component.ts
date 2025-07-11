import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
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
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { Utils } from '@/helpers/utils';
import { SharedModule } from '@/shared/shared.module';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'm-datepicker',
  imports: [SharedModule, DatePickerModule, TranslatePipe],
  standalone: true,
  templateUrl: './input-datepicker.component.html',
  styleUrl: './input-datepicker.component.scss',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputDatepickerComponent),
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDatepickerComponent),
      multi: true
    },
    DatePipe
  ]
})
export class InputDatepickerComponent implements Validator, ControlValueAccessor, AfterViewInit {
  @Input() label: string = 'EMPTY';
  @Input() placeholder: string = 'EMPTY';
  @Input() type: 'text' | 'password' = 'text';
  @Input() showLabel: boolean = true;
  @Input() required?: boolean | string;
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Output() change = new EventEmitter<string>();

  control = new FormControl<any>(null);
  ngControl?: NgControl;
  _minDate: Date | null = null;
  _maxDate: Date | null = null;
  dp = inject(DatePipe);

  constructor(
    private inj: Injector,
    private cdr: ChangeDetectorRef
  ) {
    this.control.valueChanges.subscribe(value => {
      if (this.onChange) {
        try {
          const dataStr = this.dp.transform(value, 'yyyy-MM-dd')!;
          this.onChange(dataStr);
          this.change.emit(dataStr);
        } catch (e) {
          console.error(e);
        }
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
  checkRequire() {
    return this.ngControl?.control?.hasValidator(Validators.required);
  }

  writeValue(value: string | Date | null): void {
    if (value) {
      try {
        const dataStr = this.dp.transform(value, 'yyyy-MM-dd')!;
        this.control.setValue(new Date(dataStr));
      } catch (e) {
        this.control.setValue(null, { emitEvent: false });
      }
    } else {
      this.control.setValue(null, { emitEvent: false });
    }
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
    // this.absControl = control;
    return null;
  }
}
