import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { SearchableService } from '@/core/services/base.service';
import { PageableParams } from '@/core/interfaces/pageable-param';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitlesService extends SearchableService<PageableParams, Title> {
  override baseUrl: string = `${environment.baseUrl}/titles`;

  findAllByActive(): Observable<Title[]> {
    return this.http
      .get<{ data: Title[] }>(`${this.baseUrl}/get-all-active`)
      .pipe(map(response => response.data));
  }
}
