import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { BaseComponent } from '@/shared/components/base.component';
import { ApartmentFormComponent, ApartmentInvoiceYearComponent } from '@/features/apartments/components';
import { ApartmentService } from '@/core/services/apartment.service';
import { Apartment } from '@/features/apartments/interfaces/apartment';
import { Vehicle } from '@/features/vehicles/interfaces/vehicle';
import { finalize, forkJoin } from 'rxjs';
import { Resident } from '@/features/residents/interfaces/resident';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Ripple } from 'primeng/ripple';
import { EcmFolderComponent } from '@/shared/components';
import { RouterLink } from '@angular/router';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { Constants } from '@/helpers/constants';
import { AccordionModule } from 'primeng/accordion';
import { DataTable } from '@/core/interfaces/data-table';
import { Complaint } from '@/features/complaints/interfaces/complaint';
import { ComplaintSearch } from '@/features/complaints/interfaces/complaint-search';
import { Utils } from '@/helpers/utils';
import { Paginator, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'apartment-detail',
  imports: [
    SharedModule,
    Button,
    Drawer,
    ApartmentFormComponent,
    Skeleton,
    TableModule,
    ContextMenu,
    Ripple,
    EcmFolderComponent,
    RouterLink,
    ApartmentInvoiceYearComponent,
    AccordionModule,
    Paginator
  ],
  standalone: true,
  templateUrl: './apartment-detail.component.html',
  styleUrl: './apartment-detail.component.scss'
})
export class ApartmentDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('formEdit') formEdit?: ApartmentFormComponent;
  service = inject(ApartmentService);
  data?: Apartment;
  visibleEdit = false;
  listVehicle: Vehicle[] = [];
  listResident: Resident[] = [];
  listInvoiceYear: number[] = [];
  loading = true;
  itemResidentSelect?: Resident;
  itemsMenu: MenuItem[] = [];
  visibleInvoiceYear = false;
  allIndexes: number[] = [];

  optionsPaymentStatus: DropList<Category> = {
    data: [],
    loading: true
  };

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

  paramsComplaint: ComplaintSearch = { page: 0, size: Constants.PageSize } as ComplaintSearch;

  ngOnInit() {
    this.initPermission();
    this.commonService.getCategoryByCode(Constants.DropList_PaymentStatus).subscribe(data => {
      this.optionsPaymentStatus = {
        loading: false,
        data
      };
    });
    this.commonService.getCategoryByCode(Constants.DropList_Complaint_Status).subscribe({
      next: data => {
        this.listComplaintStatus = {
          loading: false,
          data
        };
      }
    });
    this.itemsMenu = [
      {
        label: 'apartment.button.changeHomeOwner',
        icon: 'icon-home-owner-thirdary-xl',
        disabled: !!this.itemResidentSelect?.isOwner,
        command: () => this.assignHomeOwner()
      }
    ];

    const id = this.route.snapshot.params['id'];
    this.getDetail(id);
  }

  getDetail(id: string) {
    if (id) {
      this.loadingService.start();
      forkJoin([
        this.service.getById(id),
        this.service.getVehicleApartment(id),
        this.service.getResidentApartment(id),
        this.service.getApartmentInvoiceYear(id)
      ])
        .pipe(
          finalize(() => {
            this.loadingService.complete();
            this.loading = false;
          })
        )
        .subscribe({
          next: ([data, vehicles, residents, invoiceYear]) => {
            this.data = data;
            this.listVehicle = vehicles;
            this.listResident = residents;
            this.listInvoiceYear = invoiceYear?.filter(Boolean)?.sort((a, b) => b - a);
            // this.allIndexes = this.listInvoiceYear?.map((_, index) => index);
            this.getDataTableComplaint(id);
          }
        });
    }
  }

  openFormEdit() {
    this.visibleEdit = true;
    this.formEdit?.pathValueForm(this.data!);
  }

  onChangeData(data: Apartment) {
    this.getDetail(data.id);
  }

  private assignHomeOwner() {
    if (this.loading || !this.itemResidentSelect) {
      return;
    }
    this.loadingService.start();
    this.service
      .changeHomeOwner(this.data?.id!, this.itemResidentSelect!)
      .pipe(finalize(() => this.loadingService.complete()))
      .subscribe({
        next: () => {
          this.message.success('message.success');
          this.listResident.find(item => item.isOwner)!.isOwner = false;
          this.listResident.find(item => item.id === this.itemResidentSelect!.id)!.isOwner = true;
        },
        error: e => {
          this.message.error(`message.${e?.error?.errorCode}`);
        }
      });
  }

  getDataTableComplaint(id: string, params?: ComplaintSearch) {
    const paramSearch = params ?? this.paramsComplaint;
    this.dataTableComplaint.loading = true;
    this.dataTableComplaint.content = Utils.dataTablePreLoad();
    this.service
      .getApartmentComplaint(paramSearch, id)
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
    const params = { ...this.paramsComplaint, page: event.page!, size: event.rows! } as ComplaintSearch;
    this.getDataTableComplaint(this.data?.id!, params);
  }

  viewDetailComplaint(id?: number | string) {
    return this.router.navigate(['/complaint/list', id]);
  }
}
