import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Investor } from '@/features/investors/interfaces/investor';
import { SearchableService } from '@/core/services/base.service';
import { InvestorSearch } from '@/features/investors/interfaces/investor-search';
import { ResponseApi } from '@/core/interfaces/response-api';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestorService extends SearchableService<InvestorSearch, Investor, Investor> {
  override baseUrl: string = `${environment.baseUrl}/investors`;

  getInformation() {
    return this.http
      .get<ResponseApi>(`${this.baseUrl}/information`)
      .pipe(map(response => response.data));
  }

  configStorageProvider(uuid: string) {
    return this.http
      .get<
        ResponseApi<{ redirectUrl: string }>
      >(`${environment.baseUrl}/google-drive/oauth2/login/${uuid}`)
      .pipe(map(response => response.data.redirectUrl));
  }
}
