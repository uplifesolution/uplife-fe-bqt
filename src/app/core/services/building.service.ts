import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Building } from '@/features/buildings/interfaces/building';
import { SearchableService } from '@/core/services/base.service';
import { BuildingSearch } from '@/features/buildings/interfaces/building-search';

@Injectable({
  providedIn: 'root'
})
export class BuildingService extends SearchableService<BuildingSearch, Building, Building> {
  override baseUrl: string = `${environment.baseUrl}/buildings`;
}
