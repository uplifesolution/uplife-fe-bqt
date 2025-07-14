import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { ServiceCategory } from '@/features/service-management/interfaces/service-category';
import { ServiceCategorySearch } from '@/features/service-management/interfaces/service-category-search';

@Injectable({
  providedIn: 'root'
})
export class ServiceCategoryService extends SearchableService<
  ServiceCategorySearch,
  ServiceCategory,
  ServiceCategory
> {
  override baseUrl: string = `${environment.baseUrl}/services`;
}
