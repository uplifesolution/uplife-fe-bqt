import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { VehicleSearch } from '@/features/vehicles/interfaces/vehicle-search';
import { environment } from '../../../environments/environment';
import { ResponseApi } from '@/core/interfaces/response-api';
import { map, Observable } from 'rxjs';
import { VehicleCard } from '@/features/vehicles/interfaces/vehicle-card';
import { Vehicle } from '@/features/vehicles/interfaces/vehicle';

@Injectable({
  providedIn: 'root'
})
export class VehicleRequestService extends SearchableService<VehicleSearch, Vehicle> {
  override baseUrl: string = `${environment.baseUrl}/vehicles/requests`;

  getDetail(id: string): Observable<VehicleCard> {
    return this.http
      .get<ResponseApi<VehicleCard>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  approve(data: { requestId: string; cardNumber: string; nfcId: string }, file?: File) {
    const formData = new FormData();
    const jsonString = JSON.stringify(data);
    formData.append('data', new Blob([jsonString], { type: 'application/json' }));
    if (file) {
      formData.append('file', file, file.name);
    }
    return this.http.post<ResponseApi>(`${this.baseUrl}/approve`, formData);
  }

  reject(requestId: string, note: string) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/reject`, {
      id: requestId,
      note: note
    });
  }

  getSlotRemain() {
    return this.http
      .get<
        ResponseApi<
          {
            code: string;
            count: number;
          }[]
        >
      >(`${this.baseUrl}/slot-remain`)
      .pipe(map(res => res.data));
  }
}
