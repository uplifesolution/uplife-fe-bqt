import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTable } from '@/core/interfaces/data-table';
import { Constants } from '@/helpers/constants';
import { MenuItem } from 'primeng/api';
import { ResidentService } from '@/core/services/resident.service';
import { Resident } from '@/features/residents/interfaces/resident';
import { SharedModule } from '@/shared/shared.module';
import { Button } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { Skeleton } from 'primeng/skeleton';
import { BaseComponent } from '@/shared/components/base.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Category } from '@/features/common-category/interfaces/category';
import { Utils } from '@/helpers/utils';
import { finalize } from 'rxjs';
import { ResidentSearch } from '@/features/residents/interfaces/resident-search';
import { Drawer } from 'primeng/drawer';
import { InputTextComponent } from '@/shared/components';

@Component({
  selector: 'resident-list',
  imports: [
    SharedModule,
    ContextMenu,
    Paginator,
    TableModule,
    TranslatePipe,
    Button,
    Ripple,
    Skeleton,
    Drawer,
    InputTextComponent
  ],
  standalone: true,
  templateUrl: './resident-list.component.html',
  styleUrl: './resident-list.component.scss'
})
export class ResidentListComponent extends BaseComponent implements OnInit, OnDestroy {
  service = inject(ResidentService);
  dataTable: DataTable<Resident> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };
  selectedItem!: Resident;
  items: MenuItem[] = [];
  formSearch = new FormGroup({
    fullName: new FormControl(),
    phoneNumber: new FormControl(),
    apartmentNumber: new FormControl(),
    floor: new FormControl()
  });
  listStatus: Category[] = [];
  visibleDrawer: boolean = false;
  visibleDrawerCreate: boolean = false;

  ngOnInit(): void {
    this.initPermission();
    this.items = [
      {
        label: 'button.detail',
        icon: 'pi pi-eye',
        command: event => this.viewDetail()
      }
    ];
    this.commonService.getCategoryByCode(Constants.DropList_Complaint_Type).subscribe({
      next: data => {
        this.listStatus = data;
      }
    });
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
    this.service.delete(this.selectedItem.id).subscribe({
      next: () => {
        this.message.success('message.deleteItemSuccess');
        this.search(false);
      },
      error: e => {
        this.message.error(`message.${e?.error?.errorCode}`);
      }
    });
  }

  search(clickSearch: boolean) {
    if (this.dataTable.loading) {
      return;
    }
    let paramSearch = {} as ResidentSearch;
    if (clickSearch) {
      paramSearch = {
        ...this.formSearch.getRawValue(),
        page: 0,
        size: this.dataTable.size
      } as ResidentSearch;
    } else {
      paramSearch = {
        ...(this.dataTable.filter ?? { page: 0, size: this.dataTable.size })
      };
    }
    // paramSearch.buildingCode = this.authService.getBuilding();
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

  override updateItem() {}

  override viewDetail(id?: number | string) {
    return this.router.navigate([this.router.url, this.selectedItem?.id ?? id]);
  }

  ngOnDestroy() {
    this.routeState.setState(this.functionCode, this.dataTable.filter);
  }
}
