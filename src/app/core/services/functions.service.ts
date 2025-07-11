import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import { FunctionApp } from '@/features/functions/interfaces/function.interface';
import { ActionFunction } from '@/features/functions/interfaces/action-function';
import { ActionApp } from '@/features/actions/interfaces/action.interface';
import { SearchableService } from '@/core/services/base.service';
import { FunctionSearch } from '@/features/functions/interfaces/function-search';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService extends SearchableService<FunctionSearch, FunctionApp, FunctionApp> {
  override baseUrl: string = `${environment.baseUrl}/functions`;

  assignAction(data: ActionFunction[]) {
    return this.http.post(`${this.baseUrl}/assign`, data).pipe();
  }

  getActions(idFunction: number) {
    return this.http
      .get<{
        data: (Omit<ActionFunction, 'actions' | 'functions'> & {
          action: ActionApp;
          function: FunctionApp;
        })[];
      }>(`${this.baseUrl}/assign/${idFunction}`)
      .pipe(map(res => res.data));
  }
}
