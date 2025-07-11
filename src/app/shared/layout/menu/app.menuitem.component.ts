import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: '[app-menuitem]',
  template: `
    <div *ngIf="root" class="layout-menuitem-root-text">{{ item.label! | translate }}</div>
    <a [routerLink]="item.routerLink" routerLinkActive="active-route" class="p-element p-ripple">
      <em *ngIf="item.icon" class="layout-menuitem-icon" [ngClass]="item.icon || ''"></em>
      <span class="layout-menuitem-text">{{ item.label! | translate }}</span>
      <em *ngIf="item?.items" class="pi pi-angle-up layout-submenu-toggler"></em>
    </a>
    <ul *ngIf="item?.items" [@collapse]="item.expanded">
      <li
        *ngFor="let child of item?.items"
        [ngClass]="{ 'active-menuitem': child?.expanded }"
        (click)="clickItemMenu(child, $event)"
        app-menuitem
        [root]="false"
        [active]="false"
        [item]="child"
      ></li>
    </ul>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  animations: [
    trigger('collapse', [
      state('true', style({ height: AUTO_STYLE, visibility: AUTO_STYLE, overflow: 'visible' })),
      state('false', style({ height: '0', visibility: 'hidden', overflow: 'hidden' })),
      transition('false => true', animate(200 + 'ms ease-in')),
      transition('true => false', animate(200 + 'ms ease-out'))
    ])
  ]
})
export class AppMenuItemComponent {
  @Input() item!: MenuItem;
  @Input({ transform: booleanAttribute }) active: boolean = false;
  @Input({ transform: booleanAttribute }) root: boolean = true;

  constructor(private router: Router) {}

  isActiveRootMenuItem(menuitem: MenuItem): boolean {
    const url = this.router.url.split('#')[0];
    return !!(
      menuitem.items &&
      !menuitem.items.some(
        item =>
          item.routerLink === `${url}` ||
          (item.items && item.items.some(it => it.routerLink === `${url}`))
      )
    );
  }

  clickItemMenu(item: MenuItem, event: MouseEvent) {
    event.stopPropagation();
    item.expanded = !item.expanded;
    const items = this.item?.items?.filter(it => it.id !== item.id);
    this.expandItems(false, items);
  }

  expandItems(expanded: boolean, items?: MenuItem[]) {
    items?.forEach(item => {
      item.expanded = expanded;
      this.expandItems(expanded, item.items);
    });
  }
}
