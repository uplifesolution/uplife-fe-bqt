import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';
import { ParkingLog } from '@/features/parking/interfaces/parking-log';
import { ParkingLogSearch } from '@/features/parking/interfaces/parking-log-search';

@Injectable({
  providedIn: 'root'
})
export class ParkingLogService extends SearchableService<ParkingLogSearch, ParkingLog> {
  override baseUrl = `${environment.baseUrl}/parking/logs`;
}
