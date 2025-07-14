import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { BaseComponent } from '@/shared/components/base.component';
import { ResidentService } from '@/core/services/resident.service';
import { Resident } from '@/features/residents/interfaces/resident';
import { Drawer } from 'primeng/drawer';
import { ResidentFormComponent } from '@/features/residents/components/resident-form/resident-form.component';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DataTable } from '@/core/interfaces/data-table';
import { Complaint } from '@/features/complaints/interfaces/complaint';
import { Constants } from '@/helpers/constants';
import { TableModule } from 'primeng/table';
import { ComplaintSearch } from '@/features/complaints/interfaces/complaint-search';
import { Utils } from '@/helpers/utils';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { environment } from 'src/environments/environment';
import { ResidentSearch } from '../../interfaces/resident-search';
import { Rating } from 'primeng/rating';

@Component({
  selector: 'resident-detail',
  imports: [SharedModule, Drawer, ResidentFormComponent, Button, RouterLink, Paginator, TableModule, Rating],
  standalone: true,
  templateUrl: './resident-detail.component.html',
  styleUrl: './resident-detail.component.scss'
})
export class ResidentDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('formEdit') formEdit?: ResidentFormComponent;
  service = inject(ResidentService);
  data?: Resident;
  visibleEdit = false;
  loading = true;
  params: ComplaintSearch = { page: 0, size: Constants.PageSize } as ComplaintSearch;
  listComplaintStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  dataTableComplaint: DataTable<Complaint> = {
    loading: true,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };

  dataTableResidentCard: DataTable<Resident> = {
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
    const id = this.route.snapshot.params['id'];
    this.getDetail(id);
    this.commonService.getCategoryByCode(Constants.DropList_Complaint_Status).subscribe({
      next: data => {
        this.listComplaintStatus = {
          loading: false,
          data
        };
      }
    });
  }

  getDetail(id: number) {
    if (id) {
      this.loadingService.start();
      this.service
        .getById(id)
        .pipe(
          finalize(() => {
            this.loadingService.complete();
            this.loading = false;
          })
        )
        .subscribe({
          next: data => {
            if (data && !data.avatarUrl) {
              data.avatarUrl = `${environment.baseUrl}/${data.gender === 'M' ? 'male' : 'female'}.jpg`;
            }
            this.data = data;
            this.search(this.data?.id);
            this.getTableResidentCard(this.data?.id);
          }
        });
    }
  }

  openFormEdit() {
    this.visibleEdit = true;
    this.formEdit?.pathValueForm(this.data!);
  }

  onChangeData(data: Resident) {
    this.getDetail(data.id);
  }

  search(id: number | string, params?: ComplaintSearch) {
    const paramSearch = params ?? this.params;
    this.dataTableComplaint.loading = true;
    this.dataTableComplaint.content = Utils.dataTablePreLoad();
    this.service
      .getResidentComplaint(paramSearch, id)
      .pipe(finalize(() => (this.dataTableComplaint.loading = false)))
      .subscribe({
        next: data => {
          this.dataTableComplaint = data;
        },
        error: () => {
          this.dataTableComplaint.content = [];
        }
      });
  }

  onPageChange(event: PaginatorState) {
    const params = { ...this.params, page: event.page!, size: event.rows! } as ComplaintSearch;
    this.search(this.data?.id!, params);
  }

  getTableResidentCard(id: number | string) {
    this.dataTableResidentCard.loading = true;
    this.service
      .getResidentCard(id)
      .pipe(finalize(() => (this.dataTableResidentCard.loading = false)))
      .subscribe({
        next: data => {
          this.dataTableResidentCard.content = data;
        },
        error: () => {
          this.dataTableResidentCard.content = [];
        }
      });
  }

  viewDetailComplaint(id?: number | string) {
    return this.router.navigate(['/complaint/list', id]);
  }
}
