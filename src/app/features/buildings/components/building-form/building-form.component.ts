import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import {
  InputDatepickerComponent,
  InputSelectComponent,
  InputTextComponent
} from '@/shared/components';
import { Board } from '@/features/management-board/interfaces/board';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationMessageService } from '@/core/services/message.service';
import { BuildingService } from '@/core/services/building.service';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { Building } from '@/features/buildings/interfaces/building';
import { filter, finalize } from 'rxjs';
import { CommonService } from '@/core/services/common.service';
import { Constants } from '@/helpers/constants';
import { ManagementBoardsService } from '@/core/services/management-boards.service';
import { Checkbox } from 'primeng/checkbox';
import { LoadingService } from '@/core/services/loading.service';

@Component({
  selector: 'building-form',
  imports: [
    SharedModule,
    InputDatepickerComponent,
    InputSelectComponent,
    InputTextComponent,
    Checkbox
  ],
  standalone: true,
  templateUrl: './building-form.component.html',
  styleUrl: './building-form.component.scss'
})
export class BuildingFormComponent implements OnInit {
  @Output() changeData = new EventEmitter<Building>();
  form = new FormGroup({
    id: new FormControl<number | null>(null),
    name: new FormControl<string | null>(null, Validators.required),
    code: new FormControl<string | null>(null, Validators.required),
    statusCode: new FormControl<string | null>(null, Validators.required),
    numFloors: new FormControl<number | null>(null, Validators.required),
    numApartments: new FormControl<number | null>(null, Validators.required),
    parkingSlotCar: new FormControl<number | null>(null, Validators.required),
    parkingSlotMotorBike: new FormControl<number | null>(null, Validators.required),
    parkingSlotBike: new FormControl<number | null>(null, Validators.required),
    hasResidentCard: new FormControl<boolean>(false, Validators.required),
    isAuto: new FormControl<boolean>(false),
    activeDate: new FormControl<string | null>(null, Validators.required),
    provinceCode: new FormControl<null | string>(null, Validators.required),
    wardCode: new FormControl<null | string>(null, Validators.required),
    address: new FormControl<null | string>(null, Validators.required)
  });
  service = inject(BuildingService);
  messageService = inject(NotificationMessageService);
  commonService = inject(CommonService);
  loadingService = inject(LoadingService);
  managementBoardService = inject(ManagementBoardsService);
  listManagementBoard: DropList<Board> = {
    loading: true,
    data: []
  };
  @Input() statusOptions: DropList<Category> = {
    loading: true,
    data: []
  };
  listProvince: DropList<Category> = {
    loading: true,
    data: []
  };
  listWard: DropList<Category> = {
    loading: true,
    data: []
  };
  loading = false;

  ngOnInit(): void {
    this.managementBoardService.findAll().subscribe(data => {
      this.listManagementBoard = {
        loading: false,
        data
      };
    });
    this.getProvince();
    this.form.controls.provinceCode.valueChanges
      .pipe(filter(() => !this.loading))
      .subscribe(value => {
        this.form.controls.wardCode.setValue(null);
        this.listWard.data = [];
        this.getWardByDistrict(value!);
      });
  }

  getProvince() {
    this.commonService.getProvince().subscribe(data => {
      this.listProvince = {
        loading: false,
        data
      };
    });
  }

  getWardByDistrict(code: string) {
    this.listWard.loading = true;
    this.commonService.getWardByDistrict(code).subscribe(data => {
      this.listWard = {
        loading: false,
        data
      };
    });
  }

  pathValueForm(data: Building) {
    this.loadingService.start();
    this.form.reset();
    data.provinceCode = data.province?.code;
    data.wardCode = data.ward?.code;
    data.statusCode = data.status?.code;
    this.form.patchValue(data);
    this.getProvince();
    this.getWardByDistrict(data.provinceCode);
    const interval = setInterval(() => {
      if (!this.listProvince.loading && !this.listWard.loading) {
        this.loadingService.complete();
        clearInterval(interval);
      }
    }, 500);
  }

  onSave() {
    if (this.loading || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.messageService.confirm().subscribe(isConfirm => {
      if (isConfirm) {
        this.loadingService.start();
        const data = this.form.getRawValue() as Building;
        if (data.id) {
          this.service
            .update(data, data.id)
            .pipe(finalize(() => (this.loadingService.complete())))
            .subscribe({
              next: () => {
                this.messageService.success('message.success');
                this.changeData.emit(data);
              },
              error: e => {
                this.messageService.error(`message.${e?.error?.errorCode}`);
              }
            });
        } else {
          this.service
            .create(data)
            .pipe(finalize(() => (this.loadingService.complete())))
            .subscribe({
              next: () => {
                this.messageService.success('message.success');
                this.changeData.emit(data);
                this.form.reset();
              },
              error: e => {
                this.messageService.error(`message.${e?.error?.errorCode}`);
              }
            });
        }
      }
    });
  }
}
