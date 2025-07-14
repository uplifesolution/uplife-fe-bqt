import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Button, ButtonModule } from 'primeng/button';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputSelectComponent, InputTextComponent } from '@/shared/components';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { DataTable } from '@/core/interfaces/data-table';
import { Apartment } from '@/features/apartments/interfaces/apartment';
import { Constants } from '@/helpers/constants';
import { BaseComponent } from '@/shared/components/base.component';
import { ApartmentSearch } from '@/features/apartments/interfaces/apartment-search';
import { Utils } from '@/helpers/utils';
import { finalize } from 'rxjs';
import { ApartmentService } from '@/core/services/apartment.service';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { SharedModule } from '@/shared/shared.module';

@Component({
  selector: 'app-dialog-apartment-list',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    TranslateModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslatePipe,
    InputSelectComponent,
    Button,
    RadioButtonModule,
    TableModule,
    Paginator,
    Skeleton,
    SharedModule
  ],
  templateUrl: './dialog-apartment-list.component.html',
  styleUrl: './dialog-apartment-list.component.scss'
})
export class DialogApartmentListComponent extends BaseComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() listApartmentForm: Apartment[] = [];
  @Input() selectedApartment: Apartment | null = null;
  service = inject(ApartmentService);

  form = new FormGroup({
    apartmentCode: new FormControl(),
    apartmentNumber: new FormControl(),
    status: new FormControl()
  });

  @Output() togglePopup: EventEmitter<{
    visible: boolean;
    selected?: Apartment | null;
  }> = new EventEmitter();

  selectedItem: Apartment | null = null;
  statusOptions: DropList<Category> = {
    loading: true,
    data: []
  };

  dataTable: DataTable<Apartment> = {
    loading: true,
    size: Constants.PageSize,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };
  params: ApartmentSearch = { page: 0, size: Constants.PageSize } as ApartmentSearch;

  ngOnInit(): void {
    this.initPermission();
    this.search(this.params);
  }

  toggleVisible($event: boolean) {
    this.visible = $event;
    this.togglePopup.emit();
  }

  initPopup() {
    this.loadingService.start();
    this.selectedItem = this.selectedApartment;
    this.dataTable.content.forEach(
      e =>
        (e.disabled = this.listApartmentForm.some(
          item =>
            item.apartmentCode == e.apartmentCode &&
            e.apartmentCode != this.selectedApartment?.apartmentCode
        ))
    );
    this.commonService.getCategoryByCode(Constants.DropList_Apartment_Status)
      .pipe(finalize(() => this.loadingService.complete()))
      .subscribe(data => {
        this.statusOptions = {
          loading: false,
          data
        };
      });
  }

  cancel() {
    this.togglePopup.emit({
      visible: false
    });
    this.selectedItem = null;
  }

  save() {
    this.togglePopup.emit({
      visible: false,
      selected: this.selectedItem ?? null
    });
    this.selectedItem = null;
  }

  search(params?: ApartmentSearch) {
    const paramSearch =
      params ??
      ({
        ...this.form.getRawValue(),
        page: 0,
        size: this.dataTable.size
      } as ApartmentSearch);
    paramSearch.buildingCode = this.auth.getBuilding();
    this.dataTable.loading = true;
    this.dataTable.content = Utils.dataTablePreLoad();
    this.service
      .search(paramSearch)
      .pipe(finalize(() => (this.dataTable.loading = false)))
      .subscribe({
        next: data => {
          this.dataTable = data;
          data.content.forEach(
            e =>
              (e.disabled = this.listApartmentForm.some(
                item =>
                  item.apartmentCode == e.apartmentCode &&
                  e.apartmentCode != this.selectedApartment?.apartmentCode
              ))
          );
          this.params = paramSearch;
        },
        error: e => {
          this.dataTable.content = [];
          this.message.error(`message.${e?.error?.errorCode}`);
        }
      });
  }

  reloadData() {
    this.form.reset();
    this.search({
      ...this.form.getRawValue(),
      buildingCode: this.auth.getBuilding(),
      page: 0,
      size: this.dataTable.size
    } as ApartmentSearch);
  }

  onPageChange(event: PaginatorState) {
    const params = { ...this.params, page: event.page!, size: event.rows! };
    this.search(params);
  }

  get dataForm() {
    return this.form.getRawValue();
  }
}
