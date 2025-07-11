import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { SharedModule } from '@/shared/shared.module';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Utils } from '@/helpers/utils';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  template: `
    <div class="breadcrumb">
      <!--      <ng-container *ngFor="let item of breadcrumbs; last as isLast">-->
      <!--        <span-->
      <!--          [ngClass]="{-->
      <!--            'cursor-pointer': !isLast,-->
      <!--            'text-default-400': !isLast,-->
      <!--            'font-semibold text-xl': isLast-->
      <!--          }"-->
      <!--          [routerLink]="item.routerLink"-->
      <!--          >{{ item.label! | translate }}</span-->
      <!--        >-->
      <!--        <span *ngIf="!isLast" class="mx-1">/</span>-->
      <!--      </ng-container>-->
      <p-breadcrumb class="max-w-full" [model]="breadcrumbs" [home]="home">
        <ng-template #item let-item>
          <a class="cursor-pointer" [routerLink]="item.routerLink">
            <i *ngIf="item.icon" [class]="item.icon"></i>
            <span>{{ item.label | translate }}</span>
          </a>
        </ng-template>
        <ng-template #separator><span *ngIf="breadcrumbs.length">/</span></ng-template>
      </p-breadcrumb>
    </div>
  `,
  standalone: true,
  imports: [SharedModule, RouterLink, Breadcrumb]
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: MenuItem[] = [];
  route = inject(ActivatedRoute);
  router = inject(Router);
  routerSubscription: Subscription | null = null;
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  ngOnInit() {
    this.getBreadcrumbs();
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getBreadcrumbs();
      }
    });
  }

  getBreadcrumbs() {
    this.breadcrumbs = this.buildBreadcrumb(this.route.root);
    if (this.breadcrumbs.length) {
      this.breadcrumbs[this.breadcrumbs.length - 1].routerLink = undefined;
    }
  }

  private buildBreadcrumb(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: MenuItem[] = []
  ): MenuItem[] {
    const isDataConfig = !!route.routeConfig?.data;
    const path = route.routeConfig?.path ?? '';
    const nextUrl = path ? `${url}/${path}` : url;
    if (isDataConfig) {
      const labelKey = route.routeConfig?.data!['breadcrumb'];
      if (Utils.isNotEmpty(labelKey)) {
        const breadcrumb: MenuItem = {
          label: `breadcrumb.${labelKey}`,
          routerLink: nextUrl
        };
        breadcrumbs.push(breadcrumb);
      }
    }

    if (route.firstChild) {
      return this.buildBreadcrumb(route.firstChild, nextUrl, breadcrumbs);
    }
    return breadcrumbs;
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
  }
}
