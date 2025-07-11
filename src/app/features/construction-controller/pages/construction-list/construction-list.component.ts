import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTable } from '@/core/interfaces/data-table';
import { Constants } from '@/helpers/constants';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '@/shared/shared.module';
import { BaseComponent } from '@/shared/components/base.component';
import { Utils } from '@/helpers/utils';
import { finalize } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Drawer } from 'primeng/drawer';
import { InputSelectComponent, InputTextComponent } from '@/shared/components';
import { Skeleton } from 'primeng/skeleton';
import { Ripple } from 'primeng/ripple';
import { ConstructionCreateComponent } from '../../components';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { ConstructionController } from '../../interfaces/construction-controller';
import { ConstructionSearch } from '../../interfaces/construction-search';
import { ConstructionService } from '@/core/services/construction.service';

@Component({
  selector: 'construction-list',
  imports: [
    SharedModule,
    Button,
    ContextMenu,
    Paginator,
    TableModule,
    TranslatePipe,
    Drawer,
    InputTextComponent,
    Skeleton,
    Ripple,
    ConstructionCreateComponent,
    SharedModule,
    InputSelectComponent
  ],
  standalone: true,
  templateUrl: './construction-list.component.html',
  styleUrl: './construction-list.component.scss'
})
export class ConstructionListComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('formEdit') formEdit?: ConstructionCreateComponent;
  service = inject(ConstructionService);

  dataTable: DataTable<ConstructionController> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };

  selectedItem!: ConstructionController;
  itemsMenu: MenuItem[] = [];

  formSearch = new FormGroup({
    buildingCode: new FormControl(),
    apartmentId: new FormControl(),
    tenantId: new FormControl(),
    investorId: new FormControl(),
    status: new FormControl(),
    apartmentCode: new FormControl(),
    commonAreaName: new FormControl()
  });

  visibleDrawerSearch: boolean = false;
  visibleDrawerCreate: boolean = false;
  visibleDrawerEdit: boolean = false;

  listStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  listPriorityLevel: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit(): void {
    this.initPermission();
    this.getCommonCategory();
    const data = this.formSearch.getRawValue();
    const role = this.auth.getRoleSelect();
    if (role === Constants.RoleManager) {
      data.buildingCode = this.auth
        .getListBuildingUser()
        .find(item => item.code === this.auth.getBuilding())!.code;
      this.formSearch.patchValue(data);
    }
    this.itemsMenu = this.getMenuRowTable();
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
    this.commonService.getCategoryByCode(Constants.DropList_PriorityLevel).subscribe({
      next: data => {
        this.listPriorityLevel = {
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
    let paramSearch = {} as ConstructionSearch;
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

  override updateItem() {
    if (this.selectedItem) {
      this.visibleDrawerEdit = true;
      this.formEdit!.loadingService.start();
      this.service.getById(this.selectedItem?.id).subscribe({
        next: data => {
          this.formEdit?.pathValue(data);
        }
      });
    }
  }

  onChangeData(data: ConstructionController) {
    this.search(false);
  }

  override viewDetail(id?: number | string) {
    return this.router.navigate([this.router.url, this.selectedItem?.id ?? id]);
  }

  onCreate(formCreate: ConstructionCreateComponent) {
    formCreate.form.reset();
    this.visibleDrawerCreate = true;
  }

  ngOnDestroy() {
    this.routeState.setState(this.functionCode, this.dataTable.filter);
  }
}
