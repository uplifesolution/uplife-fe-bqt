import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AppState } from '@/core/interfaces/appstate';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly STORAGE_KEY = 'appConfigState';

  appState = signal<AppState>({});

  designerActive = signal(false);

  newsActive = signal(false);

  document = inject(DOCUMENT);

  platformId = inject(PLATFORM_ID);

  theme = computed(() => (this.appState()?.darkTheme ? 'dark' : 'light'));

  transitionComplete = signal<boolean>(false);

  private initialized = false;

  constructor(private http: HttpClient) {
    this.appState.set({ ...this.loadAppState() });

    effect(() => {
      const state = this.appState();

      if (!this.initialized || !state) {
        this.initialized = true;
        return;
      }
      this.saveAppState(state);
      this.handleDarkModeTransition(state);
    });
  }

  private handleDarkModeTransition(state: AppState): void {
    if (isPlatformBrowser(this.platformId)) {
      if ((document as any).startViewTransition) {
        this.startViewTransition(state);
      } else {
        this.toggleDarkMode(state);
        this.onTransitionEnd();
      }
    }
  }

  private startViewTransition(state: AppState): void {
    const transition = (document as any).startViewTransition(() => {
      this.toggleDarkMode(state);
    });

    transition.ready.then(() => this.onTransitionEnd());
  }

  private toggleDarkMode(state: AppState): void {
    if (state.darkTheme) {
      this.document.documentElement.classList.add('p-dark');
    } else {
      this.document.documentElement.classList.remove('p-dark');
    }
  }

  private onTransitionEnd() {
    this.transitionComplete.set(true);
    setTimeout(() => {
      this.transitionComplete.set(false);
    });
  }

  hideMenu() {
    this.appState.update(state => ({
      ...state,
      menuActive: false
    }));
  }

  showMenu() {
    this.appState.update(state => ({
      ...state,
      menuActive: true
    }));
  }

  hideNews() {
    this.newsActive.set(false);
  }

  showNews() {
    this.newsActive.set(true);
  }

  showDesigner() {
    this.designerActive.set(true);
  }

  hideDesigner() {
    this.designerActive.set(false);
  }

  private loadAppState(): any {
    if (isPlatformBrowser(this.platformId)) {
      const storedState = localStorage.getItem(this.STORAGE_KEY);
      if (storedState) {
        return JSON.parse(storedState);
      }
    }
    return {
      preset: 'MyPreset',
      primary: 'mytheme',
      surface: null,
      darkTheme: false,
      menuActive: false,
      designerKey: 'primeng-designer-theme',
      RTL: false
    };
  }

  private saveAppState(state: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }
  }

  uploadJsonConfig(json: any, path: string): Observable<any> {
    const fileName = path.split('/').reverse()[0];
    const lastSlashIndex = path.lastIndexOf('/');
    const directoryPath = path.substring(0, lastSlashIndex);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('path', directoryPath);
    return this.http
      .post(`${environment.baseUrl}/ecm/upload/system`, formData, { responseType: 'text' })
      .pipe();
  }

  getJsonConfig(path: string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/ecm/download/system?path=${path}`);
  }
}
