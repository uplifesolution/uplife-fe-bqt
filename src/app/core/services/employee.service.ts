import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Employee } from '@/features/employees/interfaces/employee';
import { SearchableService } from '@/core/services/base.service';
import { EmployeeSearch } from '@/features/employees/interfaces/employee-search';
import { ResponseApi } from '@/core/interfaces/response-api';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends SearchableService<EmployeeSearch, Employee> {
  override baseUrl: string = `${environment.baseUrl}/employees`;

  uploadAvatar(id: number, blob: Blob) {
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.png');
    return this.http
      .post<ResponseApi<Employee>>(`${this.baseUrl}/avatar/${id}`, formData)
      .pipe(map(response => response.data));
  }

  getSkillsCategory() {
    return this.http
      .get<ResponseApi>(`${environment.baseUrl}/skills/all`)
      .pipe(map(response => response.data));
  }

  getBuildingArea() {
    return this.http
      .get<ResponseApi>(`${environment.baseUrl}/public/building-area/list`)
      .pipe(map(response => response.data));
  }
}
