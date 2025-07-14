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
import { VoteCreateComponent } from '../../components';
import { VoteService } from '@/core/services/vote.service';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { VoteEventSearch } from '../../interfaces/vote-event-search';
import { VoteEvent } from '../../interfaces/vote-event';

@Component({
  selector: 'vote-list',
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
    VoteCreateComponent,
    SharedModule,
    InputSelectComponent
  ],
  standalone: true,
  templateUrl: './vote-list.component.html',
  styleUrl: './vote-list.component.scss'
})
export class VoteListComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('formEdit') formEdit?: VoteCreateComponent;
  service = inject(VoteService);

  dataTable: DataTable<VoteEvent> = {
    loading: false,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };

  selectedItem!: VoteEvent;
  itemsMenu: MenuItem[] = [];

  formSearch = new FormGroup({
    buildingCode: new FormControl(),
    code: new FormControl(),
    name: new FormControl(),
    type: new FormControl(),
    status: new FormControl()
  });

  visibleDrawerSearch: boolean = false;
  visibleDrawerCreate: boolean = false;
  visibleDrawerEdit: boolean = false;

  listVotingType: DropList<Category> = {
    loading: true,
    data: []
  };

  listVotingEventStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  listVotingStatus: DropList<Category> = {
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

  getType(type: string) {
    return this.listVotingType.data.find(item => item.code === type)?.name ?? '';
  }

  getCommonCategory() {
    this.commonService.getCategoryByCode(Constants.DropList_VotingEventType).subscribe({
      next: data => {
        this.listVotingType = {
          loading: false,
          data
        };
      }
    });
    this.commonService.getCategoryByCode(Constants.DropList_VotingEventStatus).subscribe({
      next: data => {
        this.listVotingEventStatus = {
          loading: false,
          data
        };
      }
    });
    this.commonService.getCategoryByCode(Constants.DropList_VotingStatus).subscribe({
      next: data => {
        this.listVotingStatus = {
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
        this.service.delete(this.selectedItem.id!).subscribe({
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
    let paramSearch = {} as VoteEventSearch;
    if (clickSearch) {
      paramSearch = { ...this.formSearch.getRawValue(), page: 0, size: this.dataTable.size };
    } else {
      paramSearch = { ...(this.dataTable.filter ?? { page: 0, size: this.dataTable.size }) };
    }

    this.dataTable.loading = true;
    this.dataTable.content = Utils.dataTablePreLoad();
    this.service
      .search(paramSearch)
      .pipe(finalize(() => this.loadingService.complete()))
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
      this.formEdit?.form.disable();
      this.service.getById(this.selectedItem.id!).subscribe({
        next: data => {
          this.formEdit?.pathValue(data);
        }
      });
    }
  }

  onChangeData(data: VoteEvent) {
    this.search(false);
  }

  override viewDetail(id?: number | string) {
    return this.router.navigate([this.router.url, this.selectedItem?.id ?? id]);
  }

  ngOnDestroy() {
    this.routeState.setState(this.functionCode, this.dataTable.filter);
  }
}
