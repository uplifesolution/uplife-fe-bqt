import { inject, Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';
import { InvoiceSearch } from '@/features/invoices/interfaces/invoice-search';
import { Invoice } from '@/features/invoices/interfaces/invoice';
import { ResponseApi } from '@/core/interfaces/response-api';
import { FileService } from '@/core/services/file.service';
import { map, Observable } from 'rxjs';
import { Utils } from '@/helpers/utils';
import { DataTable } from '../interfaces/data-table';
import { PageableParams } from '../interfaces/pageable-param';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService extends SearchableService<InvoiceSearch, Invoice> {
  fileService = inject(FileService);
  override baseUrl = `${environment.baseUrl}/invoices`;
  override urlSearch = `${this.baseUrl}/web/search`;

  summaryInvoice() {
    return this.http.post(`${this.baseUrl}/create-invoice`, {});
  }

  sendInvoice(ids: number[]) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/send`, ids);
  }

  exportInvoice(id: number) {
    return this.fileService.downloadFilePost(`${this.baseUrl}/export`, { id });
  }

  /*
   * Cập nhật trạng thái đóng tiền mặt
   **/
  updateStatus(data: { id: number; note: string; paymentMethod: string }) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/update/${data.id}`, data);
  }

  getInvoicesPreview(params: PageableParams) {
    const url = `${this.baseUrl}/preview`;
    return this.http
      .post<ResponseApi>(url, Utils.removeParamNullOrUndefined(params))
      .pipe(
        map(response => {
          return {
            loading: false,
            content: response.data.data.content,
            size: params.size,
            page: response.data.data.currentPage,
            totalElements: response.data.data.totalElements,
            totalPages: response.data.data.totalPages,
            first: params.size * params.page
          } as DataTable<any>;
        })
      );
  }

  cancelInvoice(id: number | string): Observable<any> {
    const url = `${this.baseUrl}/cancel/${id}`;
    return this.http.delete(url);
  }

  deleteInvoice(id: number | string): Observable<any> {
    const url = `${this.baseUrl}/delete/${id}`;
    return this.http.delete(url);
  }

  importInvoice(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ResponseApi>(
      `${this.baseUrl}/import`,
      formData
    );
  }
}
