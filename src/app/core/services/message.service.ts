import { Injectable, OnDestroy } from '@angular/core';
import { ToastMessageOptions } from 'primeng/api';
import { Observable, Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotifyMessageType } from '@/helpers/enums';
import { Constants } from '@/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class NotificationMessageService implements OnDestroy {
  subjectMessage = new Subject<ToastMessageOptions>();
  subjectDialog = new Subject<any>();
  options: ToastMessageOptions = {};

  constructor(private translate: TranslateService) {
    this.options = {
      life: 5000
    };
  }

  success(messageKey: string, params?: string[]) {
    this.show({
      severity: NotifyMessageType.Success,
      detail: this.translate.instant(messageKey),
      ...this.options
    });
  }

  error(messageKey: string, params?: string[]) {
    this.show({ severity: NotifyMessageType.Error, detail: messageKey, ...this.options });
  }

  info(messageKey: string, params?: string[]) {
    this.show({ severity: NotifyMessageType.Info, detail: messageKey, ...this.options });
  }

  warn(messageKey: string, params?: string[]) {
    this.show({ severity: NotifyMessageType.Warn, detail: messageKey, ...this.options });
  }

  confirm(message?: string): Observable<boolean> {
    this.subjectDialog.next({ key: Constants.Action_Create, message });
    return new Observable<boolean>(observer => {
      const sub: Subscription = this.subjectDialog.subscribe((isAccept: boolean) => {
        sub.unsubscribe();
        return observer.next(isAccept);
      });
    });
  }

  confirmDelete(message?: string): Observable<boolean> {
    this.subjectDialog.next({ key: Constants.Action_Delete, message });
    return new Observable<boolean>(observer => {
      const sub: Subscription = this.subjectDialog.subscribe((isAccept: boolean) => {
        sub.unsubscribe();
        return observer.next(isAccept);
      });
    });
  }

  confirmApproved(): Observable<any> {
    this.subjectDialog.next({ key: 'confirmApproved' });
    return new Observable<any>(observer => {
      const sub: Subscription = this.subjectDialog.subscribe(res => {
        sub.unsubscribe();
        return observer.next({ isConfirm: res.key === 'accept', data: res.data });
      });
    });
  }

  confirmReject(): Observable<any> {
    this.subjectDialog.next({ key: 'confirmReject' });
    return new Observable<any>(observer => {
      const sub: Subscription = this.subjectDialog.subscribe(res => {
        sub.unsubscribe();
        return observer.next({ isConfirm: res.key === 'accept', data: res.data });
      });
    });
  }

  private show(notify: ToastMessageOptions, params?: string[]) {
    if (notify.detail) {
      let message: string = this.translate.instant(notify.detail);
      if (params) {
        for (let i = 0; i < params.length; i++) {
          message = message.replace('{}', params[i]);
        }
      }
      notify.detail = this.translate.instant(message);
    }
    this.subjectMessage.next(notify);
  }

  ngOnDestroy(): void {
    this.subjectDialog.unsubscribe();
    this.subjectMessage.unsubscribe();
  }
}
