import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { DataTable } from '@/core/interfaces/data-table';
import { Utils } from '@/helpers/utils';
import { PageableParams } from '@/core/interfaces/pageable-param';
import { ResponseApi } from '@/core/interfaces/response-api';
import { PageableResponse } from '@/core/interfaces/pageable-response';

@Injectable()
export class CrudService<C = any, D = any> {
  protected http = inject(HttpClient);
  baseUrl: string = environment.baseUrl;
  urlFindAll: string | null = null;
  urlCreate: string | null = null;
  urlUpdate: string | null = null;
  urlDelete: string | null = null;
  urlGetById: string | null = null;

  findAll(): Observable<D[]> {
    const url = this.urlFindAll ?? this.baseUrl;
    return this.http.get<{ data: D[] }>(url).pipe(
      map(res => {
        return res.data;
      })
    );
  }

  create(data: C): Observable<any> {
    const url = this.urlCreate ?? this.baseUrl;
    return this.http.post(url, data).pipe(map(() => data));
  }

  update(data: C, id: number | string): Observable<any> {
    const url = `${this.urlUpdate ?? this.baseUrl}/${id}`;
    return this.http.put(url, data);
  }

  delete(id: number | string): Observable<any> {
    const url = `${this.urlDelete ?? this.baseUrl}/${id}`;
    return this.http.delete(url);
  }

  getById(id: number | string): Observable<D> {
    const url = `${this.urlGetById ?? this.baseUrl}/${id}`;
    return this.http.get<ResponseApi<D>>(url).pipe(map(response => response.data));
  }
}

@Injectable()
export class SearchableService<
  P extends PageableParams = PageableParams,
  D = any,
  C = any
> extends CrudService<C, D> {
  urlSearch: string | null = null;

  search(params: P) {
    const url = this.urlSearch ?? `${this.baseUrl}/search`;
    return this.http
      .post<ResponseApi<PageableResponse<D>>>(url, Utils.removeParamNullOrUndefined(params))
      .pipe(
        map(response => {
          return {
            loading: false,
            content: response.data.content,
            size: params.size,
            page: response.data.currentPage,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            first: params.size * params.page,
            filter: params
          } as DataTable<D>;
        })
      );
  }
}
