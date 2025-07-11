import { inject, Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';
import { InvoiceSearch } from '@/features/invoices/interfaces/invoice-search';
import { Invoice } from '@/features/invoices/interfaces/invoice';
import { ResponseApi } from '@/core/interfaces/response-api';
import { FileService } from '@/core/services/file.service';

@Injectable({
  providedIn: 'root'
})
export class InvoicesAdditionalService extends SearchableService<InvoiceSearch, Invoice> {
  fileService = inject(FileService);
  override baseUrl = `${environment.baseUrl}/invoices-additional`;
  override urlSearch = `${this.baseUrl}/web/search-additional`;
  override urlCreate = `${this.baseUrl}/create`;
  override urlUpdate = `${this.baseUrl}/update-additional-invoice`;

  sendInvoice(ids: number[]) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/send-additional-invoice`, ids);
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
}
