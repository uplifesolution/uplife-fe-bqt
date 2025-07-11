import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { Position } from '@/core/interfaces/position';
import { SearchableService } from '@/core/services/base.service';
import { PageableParams } from '@/core/interfaces/pageable-param';

@Injectable({
  providedIn: 'root'
})
export class PositionsService extends SearchableService<PageableParams, Position> {
  override baseUrl: string = `${environment.baseUrl}/positions`;

  findAllByActive(): Observable<Position[]> {
    return this.http
      .get<{ data: Position[] }>(`${this.baseUrl}/get-all-active`)
      .pipe(map(response => response.data));
  }
}
