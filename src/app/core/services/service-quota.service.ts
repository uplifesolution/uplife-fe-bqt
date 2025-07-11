import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { ServiceQuota } from '@/features/service-management/interfaces/service-quota';
import { ServiceQuotaSearch } from '@/features/service-management/interfaces/service-quota-search';

@Injectable({
  providedIn: 'root'
})
export class ServiceQuotaService extends SearchableService<
  ServiceQuotaSearch,
  ServiceQuota,
  ServiceQuota
> {
  override baseUrl: string = `${environment.baseUrl}/quotas`;
  override urlFindAll = `${this.baseUrl}/list`;
}
