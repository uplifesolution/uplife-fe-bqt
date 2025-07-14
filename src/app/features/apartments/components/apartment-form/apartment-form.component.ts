import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { finalize, forkJoin, of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Apartment } from '@/features/apartments/interfaces/apartment';
import { ApartmentService } from '@/core/services/apartment.service';
import {
  InputDatepickerComponent,
  InputSelectComponent,
  InputTextComponent
} from '@/shared/components';
import { SharedModule } from '@/shared/shared.module';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { Constants } from '@/helpers/constants';
import { Checkbox } from 'primeng/checkbox';
import { Resident } from '@/features/residents/interfaces/resident';
import { BaseComponent } from '@/shared/components/base.component';

@Component({
  selector: 'apartment-form',
  imports: [
    SharedModule,
    InputTextComponent,
    InputSelectComponent,
    InputDatepickerComponent,
    Checkbox
  ],
  standalone: true,
  templateUrl: './apartment-form.component.html',
  styleUrl: './apartment-form.component.scss'
})
export class ApartmentFormComponent extends BaseComponent implements OnInit {
  @Output() changeData = new EventEmitter<Apartment>();
  @Input() type: 'create' | 'update' = 'create';
  form = new FormGroup({
    id: new FormControl<string | null>(null),
    apartmentCode: new FormControl<string | null>(null, Validators.required),
    apartmentNumber: new FormControl<string | null>(null, Validators.required),
    status: new FormControl<string | null>(null, Validators.required),
    floor: new FormControl<number | null>(null, Validators.required),
    buildingBlock: new FormControl<string | null>(null, Validators.required),
    area: new FormControl<number | null>(null, Validators.required)
  });
  formHomeOwner = new FormGroup({
    id: new FormControl<number | null>(null),
    fullName: new FormControl<string | null>(null, Validators.required),
    phoneNumber: new FormControl<string | null>(null, Validators.required),
    birthDate: new FormControl<string | null>(null, Validators.required),
    gender: new FormControl<string | null>(null, Validators.required)
  });
  loading = false;
  service = inject(ApartmentService);
  statusOptions: DropList<Category> = {
    loading: true,
    data: []
  };
  genderOptions: DropList<Category> = {
    loading: true,
    data: []
  };
  addHomeOwner = false;

  ngOnInit() {
    this.commonService.getCategoryByCode(Constants.DropList_Apartment_Status).subscribe(data => {
      this.statusOptions = {
        loading: false,
        data
      };
    });
    this.commonService.getCategoryByCode(Constants.DropList_Gender).subscribe(data => {
      this.genderOptions = {
        loading: false,
        data
      };
    });
  }

  pathValueForm(data: Apartment) {
    this.addHomeOwner = !!data?.hasOwner;
    this.form.reset();
    this.form.patchValue(data);
    if (data.ownerDTO) {
      this.formHomeOwner.patchValue(data.ownerDTO);
    } else {
      this.formHomeOwner.reset();
    }
    this.loadingService.complete();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.message.confirm().subscribe(isConfirm => {
      if (isConfirm) {
        this.loadingService.start();
        const data = this.form.getRawValue() as Apartment;
        if (data.id) {
          const resident = this.formHomeOwner.getRawValue() as Resident;
          let apiHomeOwner = of({});
          if (this.addHomeOwner && this.formHomeOwner.invalid) {
            this.formHomeOwner.markAllAsTouched();
            return;
          } else if (this.addHomeOwner) {
            apiHomeOwner = this.service.addHomeOwner(data.id, resident);
          }
          forkJoin([this.service.update(data, data.id), apiHomeOwner])
            .pipe(finalize(() => this.loadingService.complete()))
            .subscribe({
              next: () => {
                this.message.success('message.success');
                this.changeData.emit({
                  ...data,
                  statusLabel:
                    this.statusOptions.data.find(item => item.code === data.status)?.name ?? ''
                });
              },
              error: e => {
                this.message.error(`message.${e?.error?.errorCode}`);
              }
            });
        } else {
          this.service
            .create(data)
            .pipe(finalize(() => this.loadingService.complete()))
            .subscribe({
              next: () => {
                this.message.success('message.success');
                this.changeData.emit(data);
                this.addHomeOwner = false;
                this.form.reset();
                this.formHomeOwner.reset();
              },
              error: e => {
                this.message.error(`message.${e?.error?.errorCode}`);
              }
            });
        }
      }
    });
  }
}
