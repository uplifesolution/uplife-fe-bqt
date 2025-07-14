import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';
import { InvoicePeriodSearch } from '@/features/invoices/interfaces/invoice-period-search';
import { InvoicePeriodConfig } from '@/features/invoices/interfaces/invoice-period-config';
import { Utils } from '@/helpers/utils';
import { map, Observable } from 'rxjs';
import { DataTable } from '../interfaces/data-table';
import { PageableParams } from '../interfaces/pageable-param';
import { ResponseApi } from '../interfaces/response-api';
import { Invoice, InvoiceStatistic } from '@/features/invoices/interfaces/invoice';

@Injectable({
  providedIn: 'root'
})
export class InvoicePeriodConfigService extends SearchableService<
  InvoicePeriodSearch,
  InvoicePeriodConfig,
  InvoicePeriodConfig
> {
  override baseUrl = `${environment.baseUrl}/invoice-periods`;
  //Ds hóa đơn mà chi tiết Cấu hình kỳ thanh toán
  getDataInvoices(params: PageableParams) {
    const url = `${this.baseUrl}/web/search`;
    return this.http
      .post<ResponseApi>(url, Utils.removeParamNullOrUndefined(params))
      .pipe(
        map(response => {
          return {
            loading: false,
            content: response.data.content,
            size: params.size,
            page: response.data.currentPage,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            first: params.size * params.page
          } as DataTable<any>;
        })
      );
  }

  getInvoiceStatistic(id: string | number): Observable<InvoiceStatistic> {
    return this.http
      .get<{ data: InvoiceStatistic }>(`${this.baseUrl}/statistic/${id}`)
      .pipe(map(response => response.data));
  }

  importInvoicePeriod(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ResponseApi>(
      `${this.baseUrl}/import`,
      formData
    );
  }
}
