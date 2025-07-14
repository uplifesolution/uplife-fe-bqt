import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Apartment } from '@/features/apartments/interfaces/apartment';
import { SearchableService } from '@/core/services/base.service';
import { ResponseApi } from '@/core/interfaces/response-api';
import { Vehicle } from '@/features/vehicles/interfaces/vehicle';
import { Resident } from '@/features/residents/interfaces/resident';
import { map } from 'rxjs';
import { ApartmentSearch } from '@/features/apartments/interfaces/apartment-search';
import { InvoiceSearch } from '@/features/invoices/interfaces/invoice-search';
import { Utils } from '@/helpers/utils';
import { DataTable } from '../interfaces/data-table';
import { Invoice } from '@/features/invoices/interfaces/invoice';
import { ComplaintSearch } from '@/features/complaints/interfaces/complaint-search';
import { Complaint } from '@/features/complaints/interfaces/complaint';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService extends SearchableService<ApartmentSearch, Apartment, Apartment> {
  override baseUrl: string = `${environment.baseUrl}/apartments`;

  getVehicleApartment(id: string) {
    return this.http
      .get<ResponseApi<Vehicle[]>>(`${this.baseUrl}/${id}/vehicles`)
      .pipe(map(response => response.data));
  }

  getResidentApartment(id: string) {
    return this.http
      .get<ResponseApi<Resident[]>>(`${this.baseUrl}/${id}/residents`)
      .pipe(map(response => response.data));
  }

  addHomeOwner(apartmentId: string, data: Resident) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/${apartmentId}/owner`, data);
  }

  changeHomeOwner(apartmentId: string, data: Resident) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/${apartmentId}/reassign-owner`, data);
  }

  getApartmentInvoiceYear(uuid: string) {
    return this.http
      .get<ResponseApi<number[]>>(`${environment.baseUrl}/invoices/apartment/years/${uuid}`)
      .pipe(map(response => response.data));
  }

  getApartmentInvoiceByYear(params: InvoiceSearch, year: number) {
    const url = `${environment.baseUrl}/invoices/apartment/search/${year}`;
    return this.http
      .post(url, Utils.removeParamNullOrUndefined(params))
      .pipe(
        map((response: any) => {
          return {
            loading: false,
            content: response.data.content,
            size: params.size,
            page: response.data.currentPage,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            first: params.size * params.page
          } as DataTable<Invoice>;
        })
      );
  }

  getApartmentComplaint(params: ComplaintSearch, uuid: string) {
    const url = `${environment.baseUrl}/complaints/apartment/${uuid}`;
    return this.http
      .get(url, { params: Utils.removeParamNullOrUndefined(params) })
      .pipe(
        map((response: any) => {
          return {
            loading: false,
            content: response.data.content,
            size: params.size,
            page: response.data.currentPage,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            first: params.size * params.page
          } as DataTable<Complaint>;
        })
      );
  }
}
