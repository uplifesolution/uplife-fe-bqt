import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule, Table } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { DataTable } from '@/core/interfaces/data-table';
import { BaseComponent } from '@/shared/components/base.component';
import { Utils } from '@/helpers/utils';
import { debounceTime, finalize } from 'rxjs';
import { ApartmentService } from '@/core/services/apartment.service';
import { DropList } from '@/core/interfaces/droplist';
import { Category } from '@/features/common-category/interfaces/category';
import { SharedModule } from '@/shared/shared.module';
import { fromEvent } from 'rxjs';
import { InvoiceSearch } from '@/features/invoices/interfaces/invoice-search';
import { Invoice } from '@/features/invoices/interfaces/invoice';

@Component({
  selector: 'apartment-invoice-year',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    TranslateModule,
    ReactiveFormsModule,
    TranslatePipe,
    RadioButtonModule,
    TableModule,
    Skeleton,
    SharedModule
  ],
  templateUrl: './apartment-invoice-year.component.html',
  styleUrl: './apartment-invoice-year.component.scss'
})
export class ApartmentInvoiceYearComponent extends BaseComponent implements OnInit {
  @Input() optionsPaymentStatus: DropList<Category> = {
    data: [],
    loading: true
  };
  private _selectedYear: number | undefined;
  private _apartmentCode: string | undefined;

  @Input() set selectedYear(value: number | undefined) {
    this._selectedYear = value;
    this.checkBothInputs();
  }
  get selectedYear(): number | undefined {
    return this._selectedYear;
  }

  @Input() set apartmentCode(value: string | undefined) {
    this._apartmentCode = value;
    this.checkBothInputs();
  }
  get apartmentCode(): string | undefined {
    return this._apartmentCode;
  }

  private checkBothInputs(): void {
    if (this.selectedYear && this.apartmentCode) {
      this.form.patchValue({
        apartmentCode: this.apartmentCode
      });
      this.search();
    }
  }
  service = inject(ApartmentService);

  @ViewChild('table') table?: Table;

  form = new FormGroup({
    apartmentCode: new FormControl()
  });

  @Output() togglePopup: EventEmitter<{
    visible: boolean;
  }> = new EventEmitter();

  dataTable: DataTable<Invoice> = {
    loading: true,
    size: 10,
    page: 0,
    totalPages: 0,
    first: 0,
    content: [],
    totalElements: 0
  };
  params: InvoiceSearch = { page: 0, size: 10 } as InvoiceSearch;

  ngOnInit(): void {
    this.initPermission();
  }

  onScroll() {
    const nativeEl = this.table?.wrapperViewChild?.nativeElement;
    if (nativeEl) {
      fromEvent(nativeEl, 'scroll').pipe(debounceTime(100)).subscribe((event: any) => {
        const el = event.target;
        const reachedBottom = el.scrollTop + el.offsetHeight >= el.scrollHeight - 1;
        if (
          reachedBottom &&
          !this.dataTable.loading &&
          this.dataTable.page < this.dataTable.totalPages - 1
        ) {
          this.loadNextPage();
        }
      });
    }
  }

  ngAfterViewInit() {
    this.onScroll();
  }

  cancel() {
    this.togglePopup.emit({
      visible: false
    });
  }

  search() {
    const paramSearch: InvoiceSearch = {
      ...this.form.getRawValue(),
      page: 0,
      size: this.dataTable.size
    } as InvoiceSearch;

    this.dataTable.loading = true;
    this.dataTable.page = 0;

    this.dataTable.content = Utils.dataTablePreLoad();

    this.service
      .getApartmentInvoiceByYear(paramSearch, this.selectedYear!)
      .pipe(finalize(() => (this.dataTable.loading = false)))
      .subscribe({
        next: data => {
          this.dataTable = data;
          this.params = paramSearch;
        },
        error: () => {
          this.dataTable.content = [];
        }
      });
  }

  loadNextPage() {
    if (!this.params) return;
    const paramSearch: InvoiceSearch = {
      ...this.params,
      page: this.params.page + 1
    };
    this.dataTable.loading = true;
    this.service
      .getApartmentInvoiceByYear(paramSearch, this.selectedYear!)
      .subscribe({
        next: data => {
          this.dataTable = {
            ...this.dataTable,
            page: data.page,
            totalPages: data.totalPages,
            content: [...this.dataTable.content, ...data.content]
          };
          this.params = paramSearch;
          this.dataTable.loading = false
        },
        error: e => {
        }
      });
  }

  viewDetailInvoice(id: string | number, type: string) {
    if (type === 'HDPS') {
      this.router.navigate(['/invoices/additional-management', id]);
    } else if(type === 'HDDV') {
      this.router.navigate(['/invoices/management', id]);
    }
  }

  get dataForm() {
    return this.form.getRawValue();
  }
}
