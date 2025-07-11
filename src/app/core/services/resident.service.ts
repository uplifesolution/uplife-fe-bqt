import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Resident } from '@/features/residents/interfaces/resident';
import { SearchableService } from '@/core/services/base.service';
import { PageableParams } from '@/core/interfaces/pageable-param';
import { Utils } from '@/helpers/utils';
import { map, Observable } from 'rxjs';
import { DataTable } from '../interfaces/data-table';
import { Complaint } from '@/features/complaints/interfaces/complaint';
import { ComplaintSearch } from '@/features/complaints/interfaces/complaint-search';

@Injectable({
  providedIn: 'root'
})
export class ResidentService extends SearchableService<PageableParams, Resident> {
  override baseUrl: string = `${environment.baseUrl}/residents`;

  getResidentComplaint(params: ComplaintSearch, id: number | string) {
    const url = `${environment.baseUrl}/complaints/resident/${id}`;
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

  getResidentCard(id: string | number): Observable<Resident[]> {
    return this.http
      .get<{ data: Resident[] }>(`${environment.baseUrl}/resident-cards/resident/${id}`)
      .pipe(map(response => response.data));
  }
}
