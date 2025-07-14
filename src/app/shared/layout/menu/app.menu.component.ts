import { AppConfigService } from '@/core/services/appconfigservice';
import { CommonModule } from '@angular/common';
import { afterNextRender, Component, computed, ElementRef, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { DomHandler } from 'primeng/dom';
import { finalize, Subscription } from 'rxjs';
import { AppMenuItemComponent } from './app.menuitem.component';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { AuthService } from '@/core/guards/auth.service';
import { MockData } from '@/helpers/mock-data';
import { Ripple } from 'primeng/ripple';
import { Menu } from 'primeng/menu';
import { LoadingService } from '@/core/services/loading.service';
import { UserAuthInfo } from '@/core/interfaces/auth';
import { Constants } from '@/helpers/constants';

@Component({
  selector: 'app-menu',
  template: `
    <div class="sidebar-header">
      <a class="app-logo" [routerLink]="['/dashboard']">
        <img src="assets/images/logo-uplife.png" alt="logo uplife" width="230px" />
      </a>
    </div>
    <div class="layout-menu-container">
      <ul class="layout-menu">
        <li
          *ngFor="let item of menu"
          class="layout-root-menuitem"
          app-menuitem
          [item]="item"
          [root]="true"
        ></li>
      </ul>
    </div>
    <div class="sidebar-footer">
      @if (user.avatarUrl) {
        <p-avatar [image]="user.avatarUrl" class="mr-2" shape="circle" size="large" />
      } @else {
        <p-avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
      }
      <div class="info-short-profile">
        <div class="fullName">{{ user.fullName }}</div>
        <div class="subName">{{ user.phoneNumber }}</div>
        <div class="title" (click)="menuRole.toggle($event)">
          {{ title }} <i class="text-primary pi pi-angle-right"></i>
        </div>
      </div>
      <i class="pi pi-sign-out" (click)="logout()"></i>
    </div>
    <p-menu [model]="roles" [popup]="true" #menuRole>
      <ng-template #item let-item>
        <a pRipple class="flex items-center p-menu-item-link">
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </ng-template>
    </p-menu>
  `,
  host: {
    class: 'layout-sidebar layout-colorscheme-menu',
    '[class.active]': 'isActive()'
  },
  standalone: true,
  imports: [CommonModule, RouterModule, AppMenuItemComponent, Avatar, Ripple, Menu, RouterLink],
  providers: [MockData]
})
export class AppMenuComponent implements OnDestroy {
  menu!: MenuItem[];
  roles: MenuItem[] = [];
  user!: UserAuthInfo;
  title!: string;

  private routerSubscription: Subscription | null = null;

  isActive = computed(() => this.configService.appState().menuActive);

  constructor(
    private configService: AppConfigService,
    private authService: AuthService,
    private mockData: MockData,
    private el: ElementRef,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.getMenu();
    this.roles = authService.getRolesOfUser().map(item => {
      return {
        label: item.name,
        command: (_event: MenuItemCommandEvent) => {
          if (this.authService.getRoleSelect() !== item.code) {
            this.authService.setRoleSelect(item);
            this.getMenu();
          }
        }
      } as MenuItem;
    });
    afterNextRender(() => {
      setTimeout(() => {
        this.scrollToActiveItem();
      }, 1);

      this.routerSubscription = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd && this.isActive()) {
          this.configService.hideMenu();
          DomHandler.unblockBodyScroll('blocked-scroll');
        }
      });
    });
    this.user = this.authService.getUserInfo();
  }

  getMenu() {
    this.title = this.authService
      .getRolesOfUser()
      .find(item => item.code === this.authService.getRoleSelect())?.name!;
    const permittedCodes = this.authService.getFunctionOfUser().map(item => item.code);
    permittedCodes.push(Constants.Function.Dashboard);
    const menu = this.mockData.getMenu();
    this.menu = this.filterMenuItemsByPermissions(menu, permittedCodes);
  }

  scrollToActiveItem() {
    let activeItem = DomHandler.findSingle(this.el.nativeElement, '.router-link-active');
    if (activeItem && !this.isInViewport(activeItem)) {
      activeItem.scrollIntoView({ block: 'center' });
    }
  }

  isInViewport(element: any) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight ||
          (document.documentElement.clientHeight &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)))
    );
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
  }

  logout() {
    this.loadingService.start();
    this.authService
      .logout()
      .pipe(finalize(() => this.loadingService.complete()))
      .subscribe();
  }

  filterMenuItemsByPermissions(menuItems: MenuItem[], permittedCodes: string[]): MenuItem[] {
    return menuItems
      .map(item => {
        const children = item.items
          ? this.filterMenuItemsByPermissions(item.items, permittedCodes)
          : [];

        const isPermitted = item.id && permittedCodes.includes(item.id.toString());

        if (isPermitted || children.length > 0) {
          return {
            ...item,
            items: children.length > 0 ? children : undefined
          };
        }

        return null;
      })
      .filter(item => !!item) as MenuItem[];
  }
}
