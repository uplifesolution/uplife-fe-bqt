import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkShiftService extends SearchableService {
  override baseUrl: string = `${environment.baseUrl}/vehicles`;
}
