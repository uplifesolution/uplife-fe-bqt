import { CommonModule, DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { DomHandler } from 'primeng/dom';
import { AppConfigService } from '@/core/services/appconfigservice';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { Building } from '@/features/buildings/interfaces/building';
import { AuthService } from '@/core/guards/auth.service';
import { Constants } from '@/helpers/constants';
import { BreadcrumbComponent } from '@/shared/layout/breadcrumb/breadcrumb.component';
import { filter, map } from 'rxjs';
import { Button } from 'primeng/button';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Select, Skeleton, BreadcrumbComponent, Button],
  templateUrl: 'app.topbar.component.html'
})
export class AppTopBarComponent implements OnDestroy {
  @Input({ transform: booleanAttribute }) showConfigurator = true;

  @Input({ transform: booleanAttribute }) showMenuButton = true;

  scrollListener: VoidFunction | null | undefined;

  private readonly window: Window;

  listBuilding: Building[] = [];
  selectBuilding: string = '';
  functionCode: string = '';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private el: ElementRef,
    private renderer: Renderer2,
    private configService: AppConfigService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    router.events
      .pipe(
        // 1. Chỉ lắng nghe sự kiện NavigationEnd
        filter(event => event instanceof NavigationEnd),
        // 2. Map đến route được kích hoạt cuối cùng
        map(() => {
          let route = this.route;
          // Đi xuống cây route để tìm child cuối cùng (là route đang hiển thị)
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        // 3. Lọc để đảm bảo route có snapshot trước khi lấy data
        filter(route => route.outlet === 'primary'),
        // 4. Lấy dữ liệu từ `data` của route snapshot
        map(route => route.snapshot.data)
      )
      .subscribe(data => {
        // 5. Gán dữ liệu cho các biến của Topbar
        if (data && data['code']) {
          this.functionCode = data['code'];
        }
      });
    authService.building$.subscribe({
      next: () => {
        this.listBuilding = [];
        this.authService.getListBuildingUser().forEach(item => {
          this.listBuilding.push({
            ...item
          });
        });
        this.selectBuilding = this.authService.getBuilding();
      }
    });
    this.window = this.document.defaultView as Window;

    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    afterNextRender(() => {
      this.bindScrollListener();
    });
  }

  isDarkMode = computed(() => this.configService.appState().darkTheme);

  isMenuActive = computed(() => this.configService.appState().menuActive);

  toggleMenu() {
    if (this.isMenuActive()) {
      this.configService.hideMenu();
      DomHandler.unblockBodyScroll('blocked-scroll');
    } else {
      this.configService.showMenu();
      DomHandler.blockBodyScroll('blocked-scroll');
    }
  }

  toggleDarkMode() {
    this.configService.appState.update(state => ({ ...state, darkTheme: !state.darkTheme }));
  }

  bindScrollListener() {
    if (!this.scrollListener) {
      this.scrollListener = this.renderer.listen(this.window, 'scroll', () => {
        if (this.window.scrollY > 0) {
          this.el.nativeElement.children[0].classList.add('layout-topbar-sticky');
        } else {
          this.el.nativeElement.children[0].classList.remove('layout-topbar-sticky');
        }
      });
    }
  }

  unbindScrollListener() {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = null;
    }
  }

  ngOnDestroy() {
    this.unbindScrollListener();
  }

  changeBuilding() {
    this.authService.setBuilding(this.selectBuilding);
    this.router.navigate(['']).then();
  }

  showBuilding() {
    return (
      ![Constants.RoleSuperAdmin, Constants.RoleInvestor].includes(
        this.authService.getRoleSelect()
      ) &&
      ![Constants.Function.ManagementInformation, Constants.Function.BuildingManagement].includes(
        this.functionCode
      )
    );
  }

  toggleLanguage() {
    const lang = this.language === 'vn' ? 'en' : 'vn';
    this.translate.use(lang).subscribe(() => {
      this.cd.markForCheck();
    });
  }

  get language() {
    return this.translate.currentLang;
  }
}
