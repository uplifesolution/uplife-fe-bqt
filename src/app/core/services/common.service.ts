import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '@/features/common-category/interfaces/category';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  baseUrl: string = `${environment.baseUrl}/commons`;

  constructor(private http: HttpClient) {}

  getCategoryByCode(code: string) {
    return this.http
      .get<{
        data: {
          code: string;
          commons: Category[];
        };
      }>(`${environment.baseUrl}/public/common-categories/${code}`)
      .pipe(map(res => res.data.commons));
  }

  getProvince() {
    return this.http
      .get<{
        data: Category[];
      }>(`${environment.baseUrl}/public/common-categories/provinces`)
      .pipe(map(res => res.data));
  }

  getWardByDistrict(district: string) {
    return this.http
      .get<{
        data: Category[];
      }>(`${environment.baseUrl}/public/common-categories/wards/${district}`)
      .pipe(map(res => res.data));
  }
}
