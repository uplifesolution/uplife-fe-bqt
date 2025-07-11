import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Complaint } from '@/features/complaints/interfaces/complaint';
import { ComplaintSearch } from '@/features/complaints/interfaces/complaint-search';
import { Utils } from '@/helpers/utils';
import { SearchableService } from '@/core/services/base.service';
import { map } from 'rxjs';
import { ResponseApi } from '@/core/interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService extends SearchableService<ComplaintSearch, Complaint> {
  override baseUrl: string = `${environment.baseUrl}/complaints`;

  getDashboardStatusByParams(params: ComplaintSearch) {
    return this.http
      .post<{
        data: { code: string; count: number }[];
      }>(`${this.baseUrl}/dashboard/status`, Utils.removeParamNullOrUndefined(params))
      .pipe(map(res => res.data));
  }

  getDashboardPriorityByParams(params: ComplaintSearch) {
    return this.http
      .post<{
        data: { code: string; count: number }[];
      }>(`${this.baseUrl}/dashboard/priority`, Utils.removeParamNullOrUndefined(params))
      .pipe(map(res => res.data));
  }

  getDataChartFeedbackByTypeChart(data: { type: string; time: string }) {
    return this.http
      .post<{ data: { name: string; count: number }[] }>(`${this.baseUrl}/dashboard/category`, data)
      .pipe(map(res => res.data));
  }

  getDataChartFeedbackByCountChart(type: string) {
    return this.http
      .post<{
        data: { timeGroup: string; total: number }[];
      }>(`${this.baseUrl}/dashboard/count`, { type })
      .pipe(map(res => res.data));
  }

  getDataChartFeedbackByResolvedChart(type: string) {
    return this.http
      .post<{
        data: { timeGroup: string; total: number; resolved: number }[];
      }>(`${this.baseUrl}/dashboard/resolved-rate`, { type })
      .pipe(map(res => res.data));
  }

  reassign(data: { complaintId: string; employeeId: string }) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/reassign`, data).pipe(map(res => res.data));
  }

  getAnalysisAndStrategy() {
    return this.http
      .get<{
        data: string;
      }>(`${this.baseUrl}/analysis-and-strategy`)
      .pipe(map(res => res.data as string));
  }

  changeStatus(data: { uuid: string; action: string }) {
    return this.http
      .post<ResponseApi>(`${this.baseUrl}/change-status`, data)
      .pipe(map(res => res.data));
  }
}
