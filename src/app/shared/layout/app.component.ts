import { IMAGE_CONFIG, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoadingComponent } from '@/shared/components';
import { LoadingService } from '@/core/services/loading.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-root',
  template: `
    @defer (when initApp) {
      <app-loading *ngIf="loading"></app-loading>
      <router-outlet></router-outlet>
    } @placeholder {
      <app-loading></app-loading>
    }
  `,
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    NgIf
  ],
  providers: [
    TranslateService,
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true
      }
    }
  ]
})
export class AppComponent {
  initApp = false;
  loading = false;

  constructor(
    translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private loadingService: LoadingService
  ) {
    translate.onLangChange.subscribe(() => {
      cdRef.markForCheck();
      console.log('change lang', translate.currentLang);
    });
    translate.addLangs(['vn', 'en']);
    translate.use('vn').subscribe({
      next: () => {
        this.initApp = true;
      }
    });
  }

  ngAfterContentChecked() {
    this.loadingService.showLoading.subscribe((res: boolean) => {
      this.loading = res;
    });
    this.cdRef.detectChanges();
  }
}
