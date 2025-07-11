import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  InputDatepickerComponent,
  InputSelectComponent,
  InputTextComponent
} from '@/shared/components';
import { TranslatePipe } from '@ngx-translate/core';
import { DropList } from '@/core/interfaces/droplist';
import { Constants } from '@/helpers/constants';
import { finalize } from 'rxjs';
import { BaseComponent } from '@/shared/components/base.component';
import { SharedModule } from '@/shared/shared.module';
import { TitlesService } from '@/core/services/titles.service';
import { Category } from '@/features/common-category/interfaces/category';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ApartmentService } from '@/core/services/apartment.service';
import { TextareaModule } from 'primeng/textarea';
import { Apartment } from '@/features/apartments/interfaces/apartment';
import { ConstructionController } from '../../interfaces/construction-controller';
import { ApartmentSearch } from '@/features/apartments/interfaces/apartment-search';
import { ConstructionService } from '@/core/services/construction.service';

@Component({
  selector: 'construction-create',
  imports: [
    SharedModule,
    InputTextComponent,
    TranslatePipe,
    InputDatepickerComponent,
    InputSelectComponent,
    RadioButtonModule,
    TableModule,
    TextareaModule
  ],
  standalone: true,
  templateUrl: './construction-create.component.html',
  styleUrl: './construction-create.component.scss'
})
export class ConstructionCreateComponent extends BaseComponent implements OnInit {
  @Output() changeData = new EventEmitter<ConstructionController>();
  service = inject(ConstructionService);
  apartmentService = inject(ApartmentService);

  form = new FormGroup({
    id: new FormControl(),
    buildingId: new FormControl(),
    apartmentUuid: new FormControl(),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
    noiseLevel: new FormControl('', Validators.required),
    workDescription: new FormControl(),
    apartmentCode: new FormControl('', Validators.required),
    apartmentNumber: new FormControl<string | null>(
      { value: null, disabled: true },
      Validators.required
    ),
    apartmentFloor: new FormControl<number | null>(
      { value: null, disabled: true },
      Validators.required
    ),
    apartmentOwner: new FormControl<string | null>(
      { value: null, disabled: true },
      Validators.required
    )
  });

  loading = false;
  formUpdate = false;
  titleService = inject(TitlesService);

  @Input() listPriorityLevel: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit() {}

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.loadingService.loading) {
      this.message.confirm().subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.loadingService.start();
          const { apartmentCode, apartmentNumber, apartmentFloor, apartmentOwner, ...dataForm } =
            this.form.getRawValue();
          const role = this.auth.getRoleSelect();
          if (role === Constants.RoleManager) {
            dataForm.buildingId = this.auth
              .getListBuildingUser()
              .find(item => item.code === this.auth.getBuilding())?.id;
          }
          let api = dataForm.id
            ? this.service.update(dataForm, dataForm.id)
            : this.service.create(dataForm);
          api.pipe(finalize(() => this.loadingService.complete())).subscribe({
            next: () => {
              this.message.success('message.success');
              this.changeData.emit(dataForm as ConstructionController);
              if(!dataForm.id) {
                this.form.reset();
              }
            },
            error: e => {
              this.message.error(`message.${e?.error?.errorCode}`);
            }
          });
        }
      });
    }
  }

  pathValue(data: ConstructionController) {
    this.loadingService.start();
    this.form.reset();
    this.form.patchValue(data);
    this.getApartmentById(data.apartmentDTO?.id!);
  }

  searchApartment() {
    this.loadingService.start();
    const apartmentCode = this.form.controls.apartmentCode.value;
    if (apartmentCode) {
      this.apartmentService
        .search({
          page: 0,
          size: Constants.PageSize,
          apartmentCode,
          buildingCode: this.auth.getBuilding()
        } as ApartmentSearch)
        .subscribe(data => {
          const item = data.content[0];
          this.getApartmentById(item.id);
        });
    } else {
      this.loadingService.complete();
    }
  }

  getApartmentById(id: number | string) {
    this.loadingService.start();
    this.apartmentService
      .getById(id)
      .pipe(finalize(() => this.loadingService.complete()))
      .subscribe({
        next: (data: Apartment) => {
          this.form.patchValue({
            apartmentCode: data.apartmentCode,
            apartmentFloor: data.floor,
            apartmentNumber: data.apartmentNumber,
            apartmentOwner: data.ownerDTO?.fullName ?? '',
            apartmentUuid: data.id
          } as any);
        }
      });
  }
}
