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
import { Committees } from '../../interfaces/committees-management';
import { CommitteeSearch } from '../../interfaces/committees-management-search';
import { CommitteeManagementService } from '@/core/services/committees-management.service';
import { CommitteeCreateComponent } from '../../components';

@Component({
  selector: 'committees-management-list',
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
    CommitteeCreateComponent,
    SharedModule,
    InputSelectComponent
  ],
  standalone: true,
  templateUrl: './committees-management-list.component.html',
  styleUrl: './committees-management-list.component.scss'
})
export class CommitteesManagementListComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('formEdit') formEdit?: CommitteeCreateComponent;
  service = inject(CommitteeManagementService);
  dataTable: DataTable<Committees> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };
  selectedItem!: Committees;
  itemsMenu: MenuItem[] = [];
  formSearch = new FormGroup({
    buildingCode: new FormControl(),
    fullName: new FormControl(),
    active: new FormControl()
  });
  visibleDrawerSearch: boolean = false;
  visibleDrawerCreate: boolean = false;
  visibleDrawerEdit: boolean = false;

  statusOptions = [
    {
      value: true,
      name: 'boards.label.active'
    },
    {
      value: false,
      name: 'boards.label.inActive'
    }
  ];

  ngOnInit(): void {
    this.initPermission();
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
    let paramSearch = {} as CommitteeSearch;
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

  onChangeData(data: Committees) {
    this.search(false);
  }

  override updateItem() {
    if (this.selectedItem) {
      this.visibleDrawerEdit = true;
      this.formEdit!.loadingService.start();
      this.formEdit?.form.disable();
      this.service.getById(this.selectedItem.id).subscribe({
        next: data => {
          this.formEdit?.pathValue(data);
        }
      });
    }
  }

  override viewDetail(id?: number | string) {
    return this.router.navigate([this.router.url, this.selectedItem?.id ?? id]);
  }

  ngOnDestroy() {
    this.routeState.setState(this.functionCode, this.dataTable.filter);
  }
}
