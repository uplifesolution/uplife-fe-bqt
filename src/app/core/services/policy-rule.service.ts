import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import { PolicyRule, TableFunctions } from '@/features/policy-rule/interfaces/policy-rule';
import { ResponseApi } from '../interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class PolicyRuleService extends SearchableService {
  override baseUrl = `${environment.baseUrl}/policy-rules`;

  getAllFunctions() {
    return this.http
      .get<{
        data: TableFunctions[];
      }>(`${environment.baseUrl}/functions/get-all`)
      .pipe(map(res => res.data));
  }

  approvePolicy(data: PolicyRule) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/approve`, data);
  }

  rejectPolicy(data: PolicyRule) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/reject`, data);
  }
}
