import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@/shared/components/base.component';
import { DataTable } from '@/core/interfaces/data-table';
import { Constants } from '@/helpers/constants';
import { MenuItem } from 'primeng/api';
import { FormControl, FormGroup } from '@angular/forms';
import { Utils } from '@/helpers/utils';
import { finalize } from 'rxjs';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { SharedModule } from '@/shared/shared.module';
import { ContextMenu } from 'primeng/contextmenu';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import {
  InputDatepickerComponent,
  InputSelectComponent,
  InputTextComponent
} from '@/shared/components';
import { Ripple } from 'primeng/ripple';
import { Skeleton } from 'primeng/skeleton';
import { PolicyRuleService } from '@/core/services/policy-rule.service';
import { PolicyRule } from '@/features/policy-rule/interfaces/policy-rule';
import { AuthService } from '@/core/guards/auth.service';
import { PolicyRuleSearch } from '../../interfaces/policy-rule-search';
import { Category } from '@/features/common-category/interfaces/category';
import { DropList } from '@/core/interfaces/droplist';
import { PolicyRuleApproveComponent, PolicyRuleFormComponent } from '../../components';

@Component({
  selector: 'policy-rule-list',
  imports: [
    SharedModule,
    ContextMenu,
    Paginator,
    TableModule,
    TranslatePipe,
    Button,
    Drawer,
    InputTextComponent,
    Ripple,
    Skeleton,
    InputSelectComponent,
    InputDatepickerComponent,
    PolicyRuleFormComponent,
    PolicyRuleApproveComponent
  ],
  standalone: true,
  templateUrl: './policy-rule-list.component.html',
  styleUrl: './policy-rule-list.component.scss'
})
export class PolicyRuleListComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('formEdit') formEdit?: PolicyRuleFormComponent;
  @ViewChild('formApprove') formApprove?: PolicyRuleApproveComponent;
  @ViewChild('formReject') formReject?: PolicyRuleApproveComponent;
  service = inject(PolicyRuleService);
  authService = inject(AuthService);
  dataTable: DataTable<PolicyRule> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };
  selectedItem!: PolicyRule;
  items: MenuItem[] = [];
  formSearch = new FormGroup({
    buildingCode: new FormControl(),
    buildingId: new FormControl(),
    title: new FormControl(),
    type: new FormControl(),
    effectiveDateFrom: new FormControl(),
    effectiveDateTo: new FormControl(),
    status: new FormControl()
  });
  visibleDrawer: boolean = false;
  visibleDrawerCreate: boolean = false;
  visibleDrawerEdit: boolean = false;
  visibleDrawerApprove: boolean = false;
  visibleDrawerReject: boolean = false;

  listStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  listPolicyRuleType: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit(): void {
    this.initPermission();
    this.getCommonCategory();
    const data = this.formSearch.getRawValue();
    const role = this.auth.getRoleSelect();
    if (role === Constants.RoleManager) {
      const building = this.auth
        .getListBuildingUser()
        .find(item => item.code === this.auth.getBuilding());
      data.buildingId = building?.id;
      data.buildingCode = building?.code;
      this.formSearch.patchValue(data);
    }
    this.items = this.getMenuRowTable();
    if (this.canAccess(Constants.Action_Approve)) {
      this.items.splice(2, 0, {
        label: 'button.approve',
        icon: 'pi pi-file-check text-success',
        command: () => this.approve()
      });
    }
    if (this.canAccess(Constants.Action_Reject)) {
      this.items.splice(3, 0, {
        label: 'button.refuse',
        icon: 'pi pi-file-excel text-danger',
        command: () => this.reject()
      });
    }
    const params = this.routeState.getState<any>(this.functionCode);
    if (params) {
      this.dataTable.filter = params;
    }
    this.search(false);
  }

  getCommonCategory() {
    this.commonService.getCategoryByCode(Constants.DropList_CommonStatus).subscribe({
      next: data => {
        this.listStatus = {
          loading: false,
          data
        };
      }
    });
    this.commonService.getCategoryByCode(Constants.DropList_PolicyRuleType).subscribe({
      next: data => {
        this.listPolicyRuleType = {
          loading: false,
          data
        };
      }
    });
  }

  override deleteItem() {
    if (!this.selectedItem) {
      return;
    }
    this.message.confirmDelete().subscribe((isConfirm: boolean) => {
      if (isConfirm) {
        this.loadingService.start();
        this.service
          .delete(this.selectedItem.id)
          .pipe(finalize(() => this.loadingService.complete()))
          .subscribe({
            next: () => {
              this.message.success('message.deleteItemSuccess');
              this.search(false);
            },
            error: e => {
              this.message.error(`message.${e?.error?.errorCode}`);
            }
          });
      }
    });
  }

  search(clickSearch: boolean) {
    if (this.dataTable.loading) {
      return;
    }
    let paramSearch = {} as PolicyRuleSearch;
    if (clickSearch) {
      paramSearch = { ...this.formSearch.getRawValue(), page: 0, size: this.dataTable.size };
    } else {
      paramSearch = {
        ...(this.dataTable.filter ?? { page: 0, size: this.dataTable.size })
      };
    }
    this.dataTable.loading = true;
    this.dataTable.content = Utils.dataTablePreLoad();
    this.service
      .search(paramSearch)
      .pipe(finalize(() => (this.dataTable.loading = false)))
      .subscribe({
        next: data => {
          this.dataTable = data;
        },
        error: () => {
          this.dataTable.content = [];
        }
      });
  }

  reloadData() {
    this.formSearch.reset();
    this.search(true);
  }

  onPageChange(event: PaginatorState) {
    this.dataTable.filter = { ...this.dataTable.filter, page: event.page!, size: event.rows! };
    this.search(false);
  }

  onChangeData(data: PolicyRule) {
    this.search(false);
  }

  override updateItem() {
    if (this.selectedItem) {
      this.visibleDrawerEdit = true;
      this.formEdit!.loadingService.start();
      this.service.getById(this.selectedItem.id!).subscribe({
        next: data => {
          this.formEdit?.pathValue(data);
        }
      });
    }
  }

  approve() {
    this.visibleDrawerApprove = true;
    this.formApprove!.loadingService.start();
    this.service.getById(this.selectedItem.id!).subscribe({
      next: data => {
        this.formApprove?.pathValue(data);
      }
    });
  }

  reject() {
    this.visibleDrawerReject = true;
    this.formReject!.loadingService.start();
    this.service.getById(this.selectedItem.id!).subscribe({
      next: data => {
        this.formReject?.pathValue(data);
      }
    });
  }

  override viewDetail(id?: number | string) {
    return this.router.navigate([this.router.url, this.selectedItem?.id ?? id]);
  }

  ngOnDestroy() {
    this.routeState.setState(this.functionCode, this.dataTable.filter);
  }
}
