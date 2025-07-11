import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { VoteEventSearch } from '@/features/vote/interfaces/vote-event-search';
import { VoteEvent } from '@/features/vote/interfaces/vote-event';
import { ResponseApi } from '../interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class VoteService extends SearchableService<VoteEventSearch, VoteEvent> {
  override baseUrl: string = `${environment.baseUrl}/voting-events`;

  startVotingEvent(id: number, data: VoteEvent) {
    return this.http.post<ResponseApi>(`${this.baseUrl}/${id}/start`, data);
  }
}
