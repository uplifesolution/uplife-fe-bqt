import { AppConfigService } from '@/core/services/appconfigservice';
import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { DomHandler } from 'primeng/dom';
import { AppMenuComponent } from './menu/app.menu.component';
import { AppTopBarComponent } from './topbar/app.topbar.component';
import { Toast } from 'primeng/toast';
import { LoginComponent } from '@/shared/layout/login/login.component';
import { AuthService } from '@/core/guards/auth.service';
import { NotificationMessageService } from '@/core/services/message.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { filter, Subscription } from 'rxjs';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Constants } from '@/helpers/constants';
import { SharedModule } from '@/shared/shared.module';
import { FirebaseService } from '@/core/services/firebase.service';
import { RouteStateService } from '@/core/services/route-state.service';

@Component({
  selector: 'app-main',
  template: `
    @if (isInitApp()) {
      <div class="layout-wrapper" [ngClass]="containerClass()">
        <app-menu />
        <app-topbar />
        <div
          class="layout-mask"
          [ngClass]="{ 'layout-mask-active': isMenuActive() }"
          (click)="hideMenu()"
        ></div>
        <div class="layout-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    } @else {
      <login></login>
    }
    <p-toast />
    <p-confirmdialog>
      <ng-template #headless let-message let-onAccept="onAccept" let-onReject="onReject">
        <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
          <span class="font-bold text-2xl block mb-2 mt-6">{{ 'confirm1' | translate }}</span>
          <p class="mb-0">{{ 'confirm2' | translate }}</p>
          <div class="flex items-center gap-2 mt-6">
            <p-button
              severity="info"
              label="{{ 'button.cancel' | translate }}"
              [outlined]="true"
              (onClick)="onReject()"
              styleClass="w-32"
            ></p-button>
            @if (keyConfirm === Constants.Action_Delete) {
              <p-button
                severity="danger"
                label="{{ 'button.delete' | translate }}"
                (onClick)="onAccept()"
                styleClass="w-32"
              ></p-button>
            } @else {
              <p-button
                label="{{ 'button.continue' | translate }}"
                (onClick)="onAccept()"
                styleClass="w-32"
              ></p-button>
            }
          </div>
        </div>
      </ng-template>
    </p-confirmdialog>
  `,
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    SharedModule,
    RouterOutlet,
    AppMenuComponent,
    AppTopBarComponent,
    Toast,
    LoginComponent,
    ConfirmDialog,
    Button
  ]
})
export class AppMainComponent implements OnInit, OnDestroy {
  configService: AppConfigService = inject(AppConfigService);
  authService = inject(AuthService);
  primeng: PrimeNG = inject(PrimeNG);
  service: NotificationMessageService = inject(NotificationMessageService);
  messageService: MessageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  firebaseService = inject(FirebaseService);
  router = inject(Router);
  routeState = inject(RouteStateService);

  isNewsActive = computed(() => this.configService.newsActive());

  isMenuActive = computed(() => this.configService.appState().menuActive);

  isRippleDisabled = computed(() => this.primeng.ripple());

  isInitApp = computed(() => !!this.authService.getToken());

  containerClass = computed(() => {
    return {
      'layout-news-active': this.isNewsActive()
      // 'p-ripple-disabled': this.isRippleDisabled,
    };
  });
  keyConfirm?: string;
  subscription: Subscription[] = [];
  readonly Constants = Constants;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe(event => {
        // clear all state trừ những route hiện tại (giữ lại nếu cùng module)
        this.routeState.clearAllExcept();
      });
    // Yêu cầu quyền và lấy token ngay khi ứng dụng khởi chạy
    this.firebaseService.requestPermissionAndGetToken();

    // Bắt đầu lắng nghe tin nhắn
    this.firebaseService.listenForMessages();

    // Lắng nghe sự thay đổi từ BehaviorSubject (tùy chọn)
    this.firebaseService.currentMessage.subscribe(message => {
      if (message) {
        console.log('Component nhận được tin nhắn mới:', message);
        // Xử lý hiển thị thông báo ở đây
      }
    });
    this.subscription.push(
      this.service.subjectMessage.subscribe(notify => {
        this.messageService.add(notify);
      })
    );
    this.subscription.push(
      this.service.subjectDialog.subscribe(data => {
        this.keyConfirm = data.key;
        this.confirmationService.confirm({
          accept: () => {
            this.service.subjectDialog.next(true);
          },
          reject: () => {
            this.service.subjectDialog.next(false);
          }
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  hideMenu() {
    this.configService.hideMenu();
    DomHandler.unblockBodyScroll('blocked-scroll');
  }
}
