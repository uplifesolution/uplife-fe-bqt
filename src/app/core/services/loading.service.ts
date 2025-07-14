import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loading = false;

  constructor() {}

  public showLoading = new BehaviorSubject<boolean>(false);

  getLoadingStatus(): Observable<boolean> {
    return this.showLoading.asObservable();
  }

  start() {
    if (!this.loading) {
      this.showLoading.next(true);
      this.loading = true;
    }
  }

  complete() {
    if (this.loading) {
      this.showLoading.next(false);
      this.loading = false;
    }
  }
}
