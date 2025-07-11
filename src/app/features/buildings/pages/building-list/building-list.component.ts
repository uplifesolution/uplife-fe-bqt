import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTable } from '@/core/interfaces/data-table';
import { Constants } from '@/helpers/constants';
import { MenuItem } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { BuildingService } from '@/core/services/building.service';
import { Building } from '@/features/buildings/interfaces/building';
import { SharedModule } from '@/shared/shared.module';
import { Button } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { Drawer } from 'primeng/drawer';
import { Skeleton } from 'primeng/skeleton';
import { FormControl, FormGroup } from '@angular/forms';
import { Category } from '@/features/common-category/interfaces/category';
import { BuildingSearch } from '@/features/buildings/interfaces/building-search';
import { Utils } from '@/helpers/utils';
import { finalize } from 'rxjs';
import { BaseComponent } from '@/shared/components/base.component';
import { InputTextComponent } from '@/shared/components';
import { Ripple } from 'primeng/ripple';
import { BuildingFormComponent } from '@/features/buildings/components';
import { DropList } from '@/core/interfaces/droplist';

@Component({
  selector: 'building-list',
  imports: [
    SharedModule,
    Button,
    ContextMenu,
    Paginator,
    TableModule,
    TranslatePipe,
    Drawer,
    Skeleton,
    InputTextComponent,
    Ripple,
    BuildingFormComponent
  ],
  standalone: true,
  templateUrl: './building-list.component.html',
  styleUrl: './building-list.component.scss'
})
export class BuildingListComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('formEdit') formEdit?: BuildingFormComponent;
  service = inject(BuildingService);
  dataTable: DataTable<Building> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };
  selectedItem!: Building;
  items: MenuItem[] = [];
  formSearch = new FormGroup({
    code: new FormControl(),
    name: new FormControl()
  });
  listStatus: Category[] = [];
  visibleDrawer: boolean = false;
  visibleDrawerCreate: boolean = false;
  visibleDrawerEdit: boolean = false;

  statusOptions: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit(): void {
    this.initPermission();
    this.items = this.getMenuRowTable();
    this.commonService.getCategoryByCode(Constants.DropList_Complaint_Type).subscribe({
      next: data => {
        this.listStatus = data;
      }
    });
    this.commonService.getCategoryByCode(Constants.DropList_Building_Status).subscribe(data => {
      this.statusOptions = {
        loading: false,
        data: data
      };
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
    this.message.confirmDelete().subscribe(isConfirmed => {
      if (isConfirmed) {
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
    });
  }

  search(clickSearch: boolean) {
    if (this.dataTable.loading) {
      return;
    }
    let paramSearch = {} as BuildingSearch;
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
      this.service.getById(this.selectedItem.id).subscribe(data => {
        this.formEdit?.pathValueForm(data);
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
