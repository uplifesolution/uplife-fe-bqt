import { Injectable } from '@angular/core';
import { SearchableService } from '@/core/services/base.service';
import { Board } from '@/features/management-board/interfaces/board';
import { BoardSearch } from '@/features/management-board/interfaces/board-search';
import { environment } from '../../../environments/environment';
import { ResponseApi } from '@/core/interfaces/response-api';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagementBoardsService extends SearchableService<BoardSearch, Board, Board> {
  override baseUrl: string = `${environment.baseUrl}/management-boards`;

  getManagementBoardInformation() {
    return this.http
      .get<ResponseApi<Board>>(`${this.baseUrl}/information`)
      .pipe(map(response => response.data));
  }

  uploadLogo(id: number, blob: Blob) {
    const formData = new FormData();
    formData.append('logo', blob, 'Logo.png');
    return this.http
      .post<ResponseApi<Board>>(`${this.baseUrl}/logo/${id}`, formData)
      .pipe(map(response => response.data));
  }
}
