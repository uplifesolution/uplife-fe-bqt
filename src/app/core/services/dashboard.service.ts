import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponseApi } from '@/core/interfaces/response-api';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardInvoice() {
    return this.http
      .get<ResponseApi>(`${environment.baseUrl}/dashboards/invoice/period`)
      .pipe(map(res => res.data));
  }

  getDashboardVehicle() {
    return this.http
      .get<ResponseApi>(`${environment.baseUrl}/dashboards/vehicle/vehicle-type`)
      .pipe(map(res => res.data));
  }

  getDashboardComplaintType(data: { startDate: string; endDate: string }) {
    return this.http
      .post<ResponseApi>(`${environment.baseUrl}/dashboards/complaint/category`, data)
      .pipe(map(res => res.data));
  }

  getDashboardComplaintMonthly(data: { startDate: string; endDate: string }) {
    return this.http
      .post<ResponseApi>(`${environment.baseUrl}/dashboards/complaint/month`, data)
      .pipe(map(res => res.data));
  }

  getDashboardApartmentStatus() {
    return this.http
      .get<ResponseApi>(`${environment.baseUrl}/dashboards/apartment/status`)
      .pipe(map(res => res.data));
  }

  getDashboardResident() {
    return this.http
      .get<ResponseApi>(`${environment.baseUrl}/dashboards/resident/age`)
      .pipe(map(res => res.data));
  }
}
