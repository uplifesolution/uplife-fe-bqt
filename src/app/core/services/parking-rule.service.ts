import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { environment } from '../../../environments/environment';
import { ParkingRuleSearch } from '@/features/parking/interfaces/parking-rule-search';
import { ParkingRule } from '@/features/parking/interfaces/parking-rule';

@Injectable({
  providedIn: 'root'
})
export class ParkingRuleService extends SearchableService<
  ParkingRuleSearch,
  ParkingRule,
  ParkingRule
> {
  override baseUrl = `${environment.baseUrl}/parking-rules`;
}
