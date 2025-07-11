import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { ConstructionSearch } from '@/features/construction-controller/interfaces/construction-search';
import { ConstructionController } from '@/features/construction-controller/interfaces/construction-controller';

@Injectable({
  providedIn: 'root'
})
export class ConstructionService extends SearchableService<ConstructionSearch, ConstructionController> {
  override baseUrl: string = `${environment.baseUrl}/constructions`;
}
