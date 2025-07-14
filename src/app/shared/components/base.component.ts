import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@/core/guards/auth.service';
import { Constants } from '@/helpers/constants';
import { NotificationMessageService } from '@/core/services/message.service';
import { MenuItem } from 'primeng/api';
import { LoadingService } from '@/core/services/loading.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FileService } from '@/core/services/file.service';
import { CommonService } from '@/core/services/common.service';
import { RouteStateService } from '@/core/services/route-state.service';

export class BaseComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  auth = inject(AuthService);
  loadingService = inject(LoadingService);
  message = inject(NotificationMessageService);
  sanitizer = inject(DomSanitizer);
  fileService = inject(FileService);
  commonService = inject(CommonService);
  routeState = inject(RouteStateService);
  allowedActions: string[] = [];
  functionCode: string = '';
  readonly Constants = Constants;

  protected initPermission() {
    this.functionCode = this.route.snapshot.data['code'];
    if (this.functionCode) {
      this.routeState.setRoute(this.functionCode);
    }
    const found = this.auth.getFunctionOfUser().find(p => p.code === this.functionCode);
    this.allowedActions = found?.actions ?? [];
  }

  canAccess(action: string): boolean {
    return this.allowedActions.includes(action);
  }

  getMenuRowTable(): MenuItem[] {
    const items: MenuItem[] = [];
    if (this.canAccess(Constants.Action_Detail)) {
      items.push({
        label: 'button.detail',
        icon: 'pi pi-eye',
        command: event => this.viewDetail()
      });
    }
    if (this.canAccess(Constants.Action_Update)) {
      items.push({
        label: 'button.update',
        icon: 'pi pi-pen-to-square',
        command: event => this.updateItem()
      });
    }
    if (this.canAccess(Constants.Action_Delete)) {
      items.push({
        label: 'button.delete',
        icon: 'pi pi-trash text-danger',
        command: event => this.deleteItem()
      });
    }
    return items;
  }

  updateItem() {}

  deleteItem() {}

  viewDetail() {}
}
