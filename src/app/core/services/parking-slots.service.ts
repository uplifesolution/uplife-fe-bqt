import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParkingSlotsService extends SearchableService {
  override baseUrl = `${environment.baseUrl}/parking-slots`;
}
