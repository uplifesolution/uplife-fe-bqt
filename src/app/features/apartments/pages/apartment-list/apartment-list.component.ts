import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTable } from '@/core/interfaces/data-table';
import { Constants } from '@/helpers/constants';
import { MenuItem } from 'primeng/api';
import { ApartmentService } from '@/core/services/apartment.service';
import { Apartment } from '@/features/apartments/interfaces/apartment';
import { SharedModule } from '@/shared/shared.module';
import { Skeleton } from 'primeng/skeleton';
import { Drawer } from 'primeng/drawer';
import { InputSelectComponent, InputTextComponent } from '@/shared/components';
import { Button } from 'primeng/button';
import { FormControl, FormGroup } from '@angular/forms';
import { Category } from '@/features/common-category/interfaces/category';
import { Utils } from '@/helpers/utils';
import { finalize } from 'rxjs';
import { BaseComponent } from '@/shared/components/base.component';
import { ApartmentSearch } from '@/features/apartments/interfaces/apartment-search';
import { Ripple } from 'primeng/ripple';
import { ApartmentFormComponent } from '@/features/apartments/components';
import { DropList } from '@/core/interfaces/droplist';

@Component({
  selector: 'apartment-list',
  imports: [
    SharedModule,
    ContextMenu,
    Paginator,
    TableModule,
    TranslatePipe,
    Skeleton,
    Drawer,
    InputTextComponent,
    Button,
    Ripple,
    ApartmentFormComponent,
    InputSelectComponent
  ],
  standalone: true,
  templateUrl: './apartment-list.component.html',
  styleUrl: './apartment-list.component.scss'
})
export class ApartmentListComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('formEdit') formEdit?: ApartmentFormComponent;
  service = inject(ApartmentService);
  dataTable: DataTable<Apartment> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0,
  };
  selectedItem!: Apartment;
  items: MenuItem[] = [];
  formSearch = new FormGroup({
    apartmentCode: new FormControl(),
    apartmentNumber: new FormControl(),
    status: new FormControl()
  });
  listStatus: DropList<Category> = {
    loading: true,
    data: []
  };
  visibleDrawer: boolean = false;
  visibleDrawerCreate: boolean = false;
  visibleDrawerEdit: boolean = false;

  ngOnInit(): void {
    this.initPermission();
    this.items = this.getMenuRowTable();
    const params = this.routeState.getState<any>(this.functionCode);
    if (params) {
      this.dataTable.filter = params;
    }
    this.commonService.getCategoryByCode(Constants.DropList_Apartment_Status).subscribe({
      next: data => {
        this.listStatus = {
          data,
          loading: false
        };
      }
    });
    this.search(false);
  }

  override deleteItem() {
    if (!this.selectedItem) {
      return;
    }
    this.message.confirmDelete().subscribe(isConfirmed => {
      if (isConfirmed) {
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
    let paramSearch = {} as ApartmentSearch;
    if (clickSearch) {
      paramSearch = {
        ...this.formSearch.getRawValue(),
        page: 0,
        size: this.dataTable.size
      } as ApartmentSearch;
    } else {
      paramSearch = { ...(this.dataTable.filter ?? { page: 0, size: this.dataTable.size }) };
    }

    paramSearch.buildingCode = this.auth.getBuilding();
    this.dataTable.loading = true;
    this.dataTable.content = Utils.dataTablePreLoad();
    this.service
      .search(paramSearch)
      .pipe(finalize(() => (this.dataTable.loading = false)))
      .subscribe({
        next: data => {
          this.dataTable = data;
        },
        error: e => {
          this.dataTable.content = [];
          this.message.error(`message.${e?.error?.errorCode}`);
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

  onChangeData(data: Apartment) {
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
