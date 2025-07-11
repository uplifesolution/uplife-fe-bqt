import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActionApp } from '@/features/actions/interfaces/action.interface';
import { SearchableService } from '@/core/services/base.service';
import { PageableParams } from '@/core/interfaces/pageable-param';

@Injectable({
  providedIn: 'root'
})
export class ActionsService extends SearchableService<PageableParams, ActionApp> {
  override baseUrl: string = `${environment.baseUrl}/actions`;
}
