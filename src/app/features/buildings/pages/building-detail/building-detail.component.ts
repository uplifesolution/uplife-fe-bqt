import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { BaseComponent } from '@/shared/components/base.component';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { BuildingFormComponent } from '@/features/buildings/components';
import { BuildingService } from '@/core/services/building.service';
import { Building, BuildingServicesContent } from '@/features/buildings/interfaces/building';
import { Constants } from '@/helpers/constants';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { EcmFolderComponent } from '@/shared/components';
import { TableModule } from 'primeng/table';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DataTable } from '@/core/interfaces/data-table';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'building-detail',
  imports: [
    SharedModule,
    Button,
    Drawer,
    BuildingFormComponent,
    EcmFolderComponent,
    TableModule,
    Paginator,
    RouterLink
  ],
  standalone: true,
  templateUrl: './building-detail.component.html',
  styleUrl: './building-detail.component.scss'
})
export class BuildingDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('formEdit') formEdit?: BuildingFormComponent;
  service = inject(BuildingService);
  data?: Building;
  visibleEdit = false;

  statusOptions: DropList<Category> = {
    loading: true,
    data: []
  };

  servicesTable: DataTable<BuildingServicesContent> = {
    loading: true,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };

  ngOnInit() {
    this.initPermission();
    this.commonService.getCategoryByCode(Constants.DropList_Building_Status).subscribe(data => {
      this.statusOptions = {
        loading: false,
        data: data
      };
    });
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadingService.start();
      this.service
        .getById(id)
        .pipe(finalize(() => this.loadingService.complete()))
        .subscribe({
          next: data => {
            this.data = data;
            this.getDatableServies();
          }
        });
    }
  }

  getDatableServies() {
    const start = this.servicesTable.first;
    const end = start + this.servicesTable.size;
    this.servicesTable.content = this.data?.services?.slice(start, end) ?? [];
    this.servicesTable.loading = false;
  }

  onPageChange(event: PaginatorState) {
    this.servicesTable.loading = true;
    this.servicesTable.page = event.page!;
    this.servicesTable.size = event.rows!;
    this.servicesTable.first = event.first!;
    this.getDatableServies();
  }

  openFormEdit() {
    this.visibleEdit = true;
    this.formEdit?.pathValueForm(this.data!);
  }

  onChangeData(data: Building) {
    this.service.getById(data.id).subscribe({
      next: data => {
        this.data = data;
      }
    });
  }

  getLinkManagementBoard() {
    if (this.auth.getRoleSelect() === Constants.RoleManager) {
      return ['/management-board-information'];
    }
    return ['/management-board', this.data?.managementBoard?.id];
  }
}
