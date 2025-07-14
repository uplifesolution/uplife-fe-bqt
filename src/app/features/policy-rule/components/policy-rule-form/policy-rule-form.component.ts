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
import { Category } from '@/features/common-category/interfaces/category';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { CommonService } from '@/core/services/common.service';
import { PolicyRule, TableFunctions } from '../../interfaces/policy-rule';
import { PolicyRuleService } from '@/core/services/policy-rule.service';
import { DataTable } from '@/core/interfaces/data-table';
import { Paginator, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'policy-rule-form',
  imports: [
    SharedModule,
    InputTextComponent,
    TranslatePipe,
    InputDatepickerComponent,
    InputSelectComponent,
    RadioButtonModule,
    TableModule,
    TextareaModule,
    Paginator
  ],
  standalone: true,
  templateUrl: './policy-rule-form.component.html',
  styleUrl: './policy-rule-form.component.scss'
})
export class PolicyRuleFormComponent extends BaseComponent implements OnInit {
  @Output() changeData = new EventEmitter<PolicyRule>();
  service = inject(PolicyRuleService);

  dataTable: DataTable<TableFunctions> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };

  data: TableFunctions[] = [];

  form = new FormGroup({
    id: new FormControl(),
    buildingId: new FormControl(),
    ackRequired: new FormControl(),
    title: new FormControl('', Validators.required),
    effectiveDate: new FormControl('', Validators.required),
    expiredDate: new FormControl('', Validators.required),
    type: new FormControl<string | null>({ value: null, disabled: false }, Validators.required),
    note: new FormControl(),
    functionIds: new FormControl(),
  });

  selectedItems: TableFunctions[] = [];

  @Input() listStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  @Input() listPolicyRuleType: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit() {
    this.service.getAllFunctions().subscribe({
      next: data => {
        this.data = data;
        this.updatePagedData();
      }
    });
  }

  onSave() {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.loadingService.loading) {
      this.message.confirm().subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.loadingService.start();
          const dataForm = this.form.getRawValue();
          if(this.selectedItems.length > 0) {
            dataForm.functionIds = this.selectedItems.map(item => item.id);
          } else {
            dataForm.functionIds = null;
          }
          const role = this.auth.getRoleSelect();
          if (role === Constants.RoleManager) {
            dataForm.buildingId = this.auth
              .getListBuildingUser()
              .find(item => item.code === this.auth.getBuilding())?.id;
          }
          let api = dataForm.id ? this.service.update(dataForm, dataForm.id) : this.service.create(dataForm);
          api.pipe(finalize(() => (this.loadingService.complete()))).subscribe({
            next: () => {
              this.message.success('message.success');
              this.changeData.emit(dataForm as any);
              if(!dataForm.id) {
                this.form.reset();
                this.selectedItems = [];
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

  onPageChange(event: PaginatorState) {
    this.dataTable.page = event.page!;
    this.dataTable.size = event.rows!;
    this.dataTable.first = event.first!;
    this.updatePagedData();
  }

  updatePagedData() {
    const start = this.dataTable.first;
    const end = start + this.dataTable.size;
    this.dataTable.content = this.data.slice(start, end);
  }


  pathValue(data: PolicyRule) {
    this.form.reset();
    this.loadingService.start();
    this.form.patchValue({
      ...data,
      type: data.typeDTO?.code,
    });
    this.selectedItems = this.data.filter(item => data.policyRuleFunctionDTOS?.some(func => func.functionId === item.id)) ?? [];
    const IdsFunctions = data.policyRuleFunctionDTOS?.map(item => item.functionId) || [];
    if(IdsFunctions.length > 0) {
      const idArray = new Set(IdsFunctions);
      this.data.sort((a, b) => {
        const aInSet = idArray.has(a.id);
        const bInSet = idArray.has(b.id);

        if (aInSet && !bInSet) return -1;
        if (!aInSet && bInSet) return 1;

        return 0;
      });
    }
    this.updatePagedData();
    this.loadingService.complete();
  }

}
