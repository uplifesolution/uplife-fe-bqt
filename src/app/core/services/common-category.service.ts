import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { Category } from '@/features/common-category/interfaces/category';
import { CategorySearch } from '@/features/common-category/interfaces/category-search';

@Injectable({
  providedIn: 'root'
})
export class CommonCategoryService extends SearchableService<CategorySearch, Category, Category> {
  override baseUrl: string = `${environment.baseUrl}/common-categories`;
}
