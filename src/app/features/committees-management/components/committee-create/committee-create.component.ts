import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
import { Committees } from '../../interfaces/committees-management';
import { CommitteeManagementService } from '@/core/services/committees-management.service';
import { TitlesService } from '@/core/services/titles.service';
import { Title } from '@angular/platform-browser';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'committee-create',
  imports: [
    SharedModule,
    InputTextComponent,
    TranslatePipe,
    InputDatepickerComponent,
    InputSelectComponent,
    TextareaModule
  ],
  standalone: true,
  templateUrl: './committee-create.component.html',
  styleUrl: './committee-create.component.scss'
})
export class CommitteeCreateComponent extends BaseComponent implements OnInit {
  @Output() changeData = new EventEmitter<Committees>();
  service = inject(CommitteeManagementService);

  form = new FormGroup({
    id: new FormControl(),
    fullName: new FormControl(),
    phone: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl(),
    buildingId: new FormControl(),
    titleId: new FormControl(),
    isRepresentative: new FormControl(false),
    isPrimaryRepresentative: new FormControl(false),
    biography: new FormControl(),
    active: new FormControl()
  });

  loading = false;
  formUpdate = false;
  titleService = inject(TitlesService);

  titleOptions: DropList<Title> = {
    loading: true,
    data: []
  };

  ngOnInit() {
    this.titleService.findAllByActive().subscribe(data => {
      this.titleOptions = {
        loading: false,
        data
      };
    });
  }

  onSave() {
    if (this.form.valid && !this.loading) {
      this.message.confirm().subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.loadingService.start();
          const data = this.form.getRawValue() as Committees;
          const role = this.auth.getRoleSelect();
          if (role === Constants.RoleManager) {
            data.buildingId = this.auth
              .getListBuildingUser()
              .find(item => item.code === this.auth.getBuilding())!.id;
          }
          let api = data.id ? this.service.update(data, data.id) : this.service.create(data);

          api.pipe(finalize(() => (this.loadingService.complete()))).subscribe({
            next: () => {
              this.message.success('message.success');
              this.changeData.emit(data);
              if(!data.id) {
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

  pathValue(data: Committees) {
    this.form.reset();
    this.loadingService.start();
    this.form.patchValue({
      ...data,
      titleId: data.titleDTO?.id,
      buildingId: data?.buildingDTO?.id,
    });
    this.loadingService.complete();
    this.form.enable();
  }
}
