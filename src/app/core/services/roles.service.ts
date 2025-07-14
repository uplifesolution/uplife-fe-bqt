import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { Role } from '@/features/roles/interfaces/role';
import { SearchableService } from '@/core/services/base.service';
import { PageableParams } from '@/core/interfaces/pageable-param';

@Injectable({
  providedIn: 'root'
})
export class RolesService extends SearchableService<PageableParams, Role, Role> {
  override baseUrl: string = `${environment.baseUrl}/roles`;

  getPermissionByRoleId(id: number): Observable<number[]> {
    return this.http
      .get<{ data: number[] }>(`${this.baseUrl}/permission/${id}`)
      .pipe(map(response => response.data));
  }

  assignPermissionByRoleId(id: number, permissionIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign`, {
      roleId: id,
      actionFunctionIds: permissionIds
    });
  }
}
