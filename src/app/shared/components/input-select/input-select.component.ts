import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Injector,
  Input
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
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Utils } from '@/helpers/utils';
import { Select } from 'primeng/select';

@Component({
  selector: 'm-select',
  templateUrl: './input-select.component.html',
  styleUrl: './input-select.component.scss',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    DropdownModule,
    ReactiveFormsModule,
    MultiSelectModule,
    CommonModule,
    Select,
    TranslatePipe
  ]
})
export class InputSelectComponent implements AfterViewInit, Validator, ControlValueAccessor {
  @Input() label: string = 'EMPTY';
  @Input() showLabel: boolean = true;
  @Input() options: any;
  @Input() isMultiSelect: boolean = false;
  @Input() display = 'comma';
  @Input() optionValue: string = 'code';
  @Input() optionLabel: string = 'name';
  @Input() dropdownIcon: string = 'pi pi-chevron-down';
  @Input() optionDisabled: string = 'disabled';
  @Input() scrollHeight: string = '200px';
  @Input() showClear: boolean = true;
  @Input() readonly: boolean = false;
  @Input() loading: boolean = false;
  @Input() virtualScroll: boolean = false;
  ngControl?: NgControl;
  control = new FormControl();

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

  _filter = false;

  get filter() {
    return this._filter;
  }

  @Input() set filter(value: boolean) {
    this._filter = value;
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

  onChange = (value: string) => {};

  onTouched = () => {};

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
    if (this.ngControl) {
      this.ngControl.control?.markAsPristine();
    }
  }

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
    return null;
  }
}
