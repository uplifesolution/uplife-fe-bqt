import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { $dt, updatePreset } from '@primeng/themes';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DesignerService {
  constructor(private http: HttpClient) {}

  preset = signal<any>(null);

  acTokens = signal([]);

  resolveColor(token: string) {
    if (token.startsWith('{') && token.endsWith('}')) {
      let cssVariable = $dt(token).variable.slice(4, -1);
      return getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
    } else {
      return token;
    }
  }

  setPreset(preset: any) {
    this.preset.set(preset);
  }

  setAcTokens(token: any) {
    this.acTokens.set(token);
  }

  uploadTheme(theme: any) {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'my-theme.json');
    formData.append('path', 'ECM/system/fe');
    return this.http.post(`${environment.baseUrl}/ecm/upload/system`, formData).pipe();
  }

  getTheme(): Observable<any> {
    return this.http
      .get(`${environment.baseUrl}/ecm/download/system?path=ECM/system/fe/my-theme.json`)
      .pipe(
        tap((theme: any) => {
          if (theme) {
            const {
              violet,
              amber,
              emerald,
              green,
              lime,
              red,
              orange,
              yellow,
              teal,
              cyan,
              sky,
              blue,
              indigo,
              purple,
              fuchsia,
              pink,
              rose,
              slate,
              gray,
              zinc,
              neutral,
              stone,
              ...newPrimitive
            } = theme.primitive;
            const preset = {
              ...theme,
              primitive: newPrimitive
            };
            updatePreset(preset);
            this.setPreset(preset);
            console.log('theme', preset);
          }
        })
      );
  }
}
