import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
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
import { ApartmentVote, VoteEvent } from '../../interfaces/vote-event';
import { VoteService } from '@/core/services/vote.service';
import { Category } from '@/features/common-category/interfaces/category';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { ApartmentService } from '@/core/services/apartment.service';
import { DialogApartmentListComponent } from '../../dialogs';
import { TextareaModule } from 'primeng/textarea';
import { Apartment } from '@/features/apartments/interfaces/apartment';

@Component({
  selector: 'vote-create',
  imports: [
    SharedModule,
    InputTextComponent,
    TranslatePipe,
    InputDatepickerComponent,
    InputSelectComponent,
    Button,
    RadioButtonModule,
    TableModule,
    Skeleton,
    DialogApartmentListComponent,
    TextareaModule
  ],
  standalone: true,
  templateUrl: './vote-create.component.html',
  styleUrl: './vote-create.component.scss'
})
export class VoteCreateComponent extends BaseComponent implements OnInit {
  @Output() changeData = new EventEmitter<VoteEvent>();
  service = inject(VoteService);
  apartmentService = inject(ApartmentService);

  form = new FormGroup({
    id: new FormControl(),
    buildingId: new FormControl(),
    buildingCode: new FormControl(),
    code: new FormControl(),
    name: new FormControl(),
    type: new FormControl(),
    status: new FormControl(),
    content: new FormControl(),
    description: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl(),
    googleFormLink: new FormControl(),
    maxVotePerApartment: new FormControl(),
    numberOfWinners: new FormControl(),
    apartmentCodes: new FormControl(),
    isAllApartment: new FormControl(false),
    isApartment: new FormControl(false),
    isPersonal: new FormControl(false)
  });

  formArray = new FormArray<FormGroup>([]);

  loading = false;
  formUpdate = false;
  visibleCreateApartment = false;
  titleService = inject(TitlesService);

  votingType: string | null = null;
  value = 1;
  listApartments: ApartmentVote[] = [];
  selectedIndex: number | null = null;
  selectedApartment: Apartment | null = null;

  @Input() listVotingEventStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  @Input() listVotingType: DropList<Category> = {
    loading: true,
    data: []
  };

  @Input() listVotingStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  dropListApartments: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit() {}

  onSave() {
    if (this.form.valid && !this.loading) {
      this.message.confirm().subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.loadingService.start();
          const dataForm = this.form.getRawValue() as VoteEvent;
          const dataArray = this.formArray.getRawValue();
          const data = {
            id: dataForm.id,
            name: dataForm.name,
            content: dataForm.content,
            startDate: dataForm.startDate,
            endDate: dataForm.endDate,
            googleFormLink: dataForm.googleFormLink,
            type: dataForm.type,
            apartmentCodes: !dataForm.isAllApartment ? dataArray.map(item => item['apartmentCode']) : null,
            isAllApartment: dataForm.isAllApartment,
            maxVotePerApartment: +dataForm.maxVotePerApartment,
            numberOfWinners: +dataForm.numberOfWinners,
            description: dataForm.description,
          } as VoteEvent;
          const role = this.auth.getRoleSelect();
          if (role === Constants.RoleManager) {
            data.buildingId = this.auth
              .getListBuildingUser()
              .find(item => item.code === this.auth.getBuilding())?.id;
          }

          let api = data.id ? this.service.update(data, data.id) : this.service.create(data);

          api.pipe(finalize(() => (this.loadingService.complete()))).subscribe({
            next: () => {
              this.message.success('message.success');
              this.changeData.emit(data);
              if(!data.id) {
                this.form.reset();
                this.formArray = new FormArray<FormGroup>([]);
                this.listApartments = [];
                this.selectedIndex = null;
                this.selectedApartment = null;
                this.form.controls['isAllApartment']?.patchValue(false);
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

  pathValue(data: VoteEvent) {
    this.form.reset();
    this.loadingService.start();
    this.formArray = new FormArray<FormGroup>([]);
    this.listApartments = [];
    data.voteDTOs?.forEach((item: ApartmentVote) => {
      this.createQuotaItem(item);
    });
    this.form.patchValue({
      ...data,
      type: data.votingEventTypeDTO?.code,
      status: data?.statusDTO?.code,
      isAllApartment: !!data.isAllApartment
    });

    this.loadingService.complete();
    this.form.enable();
  }

  openApartmentList(index: number) {
    this.visibleCreateApartment = true;
    this.selectedIndex = index;
    this.selectedApartment = this.formArray.at(index).value as Apartment;
  }

  togglePopupCreate(event: { visible: boolean; selected?: Apartment | null }) {
    this.visibleCreateApartment = false;
    if (this.selectedIndex! > -1 && event?.selected!) {
      this.formArray.at(this.selectedIndex!).patchValue(event.selected);
    }
  }

  createQuotaItem(item?: ApartmentVote) {
    const form = new FormGroup({
      apartmentCode: new FormControl<string | null>(item?.apartmentCode ?? null)
    });
    this.formArray.push(form);
    this.listApartments.push(item ?? ({} as ApartmentVote));
  }

  removeQuotaItem(index: number) {
    this.formArray.removeAt(index);
    this.listApartments.splice(index, 1);
  }

  get getDataFormArray() {
    return this.formArray.getRawValue() as Apartment[];
  }
}
