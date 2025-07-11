import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { PreloadAllModules, provideRouter, Router, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import {
  IModuleTranslationOptions,
  ModuleTranslateLoader
} from '@larscom/ngx-translate-module-loader';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { AuthService } from '@/core/guards/auth.service';
import { catchError, retry, tap } from 'rxjs/operators';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';
import { DesignerService } from '@/core/services/designerservice';
import { environment } from '../environments/environment';
import { forkJoin, of } from 'rxjs';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { provideEchartsCore } from 'ngx-echarts';

// Sử dụng các thành phần cần thiết
echarts.use([
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
]);

export const MyPreset = definePreset(Aura, {
  components: {
    datatable: {
      extend: {
        headerCell: {
          borderWidth: '1px'
        }
      },
      css: ({ dt }: { dt: (path: string) => string }) => `
      .p-datatable-thead > tr > th {
          border-width: ${dt('datatable.header.cell.border.width')};
      }
      `
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimations(),
    provideEchartsCore({ echarts }),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    provideTranslateService({
      defaultLanguage: 'vn',
      isolate: false,
      loader: {
        provide: TranslateLoader,
        useFactory: ModuleHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    provideHttpClient(withInterceptorsFromDi()),
    providePrimeNG({
      theme: {
        // preset: MyPreset,
        options: {
          darkModeSelector: '.p-dark'
        }
      }
    }),
    // 👇 Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideMessaging(() => getMessaging()),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const design = inject(DesignerService);
      const router = inject(Router);

      const safeGetTheme$ = design.getTheme().pipe(
        retry(3),
        catchError(err => {
          console.error('Theme load error', err);
          return of(null); // fallback hoặc giá trị mặc định
        })
      );

      const safeInitAuth$ = authService.initializeAuth().pipe(
        catchError(err => {
          console.error('Auth init error', err);
          return of(false); // coi như chưa đăng nhập
        })
      );

      return forkJoin([safeGetTheme$, safeInitAuth$]).pipe(
        tap(([theme, isAuthenticated]) => {
          // const currentUrl = window.location.pathname;
          //
          // // Nếu đang ở trang public (invoice viewer) thì bỏ qua kiểm tra auth
          // const isPublicRoute = currentUrl.startsWith('/invoice-viewer');
          //
          // if (!isAuthenticated && !isPublicRoute) {
          //   router.navigateByUrl('/login').then();
          // }

          if (!isAuthenticated) {
            router.navigateByUrl('/login').then();
          }
        })
      );
    })
  ]
};

export function ModuleHttpLoaderFactory(http: HttpClient) {
  const timestamp = Date.now();
  const baseTranslateUrl = `${environment.baseUrl}/ecm/download/system?v=${timestamp}&path=${environment.pathJsonConfig}/`;

  const options: IModuleTranslationOptions = {
    // version: Date.now(),
    translateError: (error, path) => {
      console.log('Oeps! an error occurred: ', { error, path });
    },
    modules: [
      // final url: ./assets/i18n/en.json
      { baseTranslateUrl },
      { baseTranslateUrl, moduleName: 'message', namespace: 'message' },
      { baseTranslateUrl, moduleName: 'complaint', namespace: 'complaint' },
      { baseTranslateUrl, moduleName: 'investor', namespace: 'investors' },
      { baseTranslateUrl, moduleName: 'function', namespace: 'functions' },
      { baseTranslateUrl, moduleName: 'action', namespace: 'actions' },
      { baseTranslateUrl, moduleName: 'role', namespace: 'roles' },
      { baseTranslateUrl, moduleName: 'building', namespace: 'building' },
      { baseTranslateUrl, moduleName: 'boards', namespace: 'boards' },
      { baseTranslateUrl, moduleName: 'apartment', namespace: 'apartment' },
      { baseTranslateUrl, moduleName: 'resident', namespace: 'resident' },
      { baseTranslateUrl, moduleName: 'vehicle', namespace: 'vehicle' },
      { baseTranslateUrl, moduleName: 'invoices', namespace: 'invoices' },
      { baseTranslateUrl, moduleName: 'employee', namespace: 'employee' },
      { baseTranslateUrl, moduleName: 'services', namespace: 'services' },
      { baseTranslateUrl, moduleName: 'parking', namespace: 'parking' },
      { baseTranslateUrl, moduleName: 'common-category', namespace: 'category' },
      { baseTranslateUrl, moduleName: 'committee', namespace: 'committee' },
      { baseTranslateUrl, moduleName: 'caseLog', namespace: 'caseLog' },
      { baseTranslateUrl, moduleName: 'votingEvent', namespace: 'votingEvent' },
      { baseTranslateUrl, moduleName: 'construction', namespace: 'construction' },
      { baseTranslateUrl, moduleName: 'policyRule', namespace: 'policyRule' }
    ]
  };
  return new ModuleTranslateLoader(http, options);
}
