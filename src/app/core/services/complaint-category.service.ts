import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { PageableParams } from '@/core/interfaces/pageable-param';
import { ComplaintCategory } from '@/features/complaints/interfaces/complaint-category';
import { map } from 'rxjs';
import { ResponseApi } from '@/core/interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class ComplaintCategoryService extends SearchableService<
  PageableParams,
  ComplaintCategory,
  ComplaintCategory
> {
  override baseUrl: string = `${environment.baseUrl}/complaint-categories`;

  getListByBuilding(code: string) {
    return this.http
      .post<ResponseApi<ComplaintCategory[]>>(`${this.baseUrl}/list`, {
        buildingCode: code
      })
      .pipe(map(res => res.data));
  }
}
