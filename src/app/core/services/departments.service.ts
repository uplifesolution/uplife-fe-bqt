import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { Department } from '@/core/interfaces/department';
import { SearchableService } from '@/core/services/base.service';
import { ApartmentSearch } from '@/features/apartments/interfaces/apartment-search';
import { Apartment } from '@/features/apartments/interfaces/apartment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService extends SearchableService<ApartmentSearch, Apartment> {
  override baseUrl: string = `${environment.baseUrl}/departments`;

  findAllByActive(): Observable<Department[]> {
    return this.http
      .get<{ data: Department[] }>(`${this.baseUrl}/get-all-active`)
      .pipe(map(response => response.data));
  }
}
