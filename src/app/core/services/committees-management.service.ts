import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { Committees } from '@/features/committees-management/interfaces/committees-management';
import { CommitteeSearch } from '@/features/committees-management/interfaces/committees-management-search';

@Injectable({
  providedIn: 'root'
})
export class CommitteeManagementService extends SearchableService<CommitteeSearch, Committees> {
  override baseUrl: string = `${environment.baseUrl}/management-committees`;
}
