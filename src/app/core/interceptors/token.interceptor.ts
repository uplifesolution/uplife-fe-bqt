import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { BehaviorSubject, filter, Observable, take, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../guards/auth.service'; // Giả định bạn có AuthService
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private loginUrl = `${environment.baseUrl}/auth/login`;
  private logoutUrl = `${environment.baseUrl}/auth/logout`;
  private refreshUrl = `${environment.baseUrl}/auth/refresh`;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lấy token từ AuthService hoặc localStorage
    const token = this.authService.getToken();

    const urlJsonInitApp = req.url.split('?')[0].endsWith('/files/download/system');
    const isAuthRequest = [this.loginUrl, this.refreshUrl].includes(req.url); // Kiểm tra xem đây có phải là request auth không

    // Clone request và thêm token vào header nếu có
    let authReq = req;
    if (token && !urlJsonInitApp && !isAuthRequest) {
      authReq = this.addToken(req, token);
    }

    // Gửi request và xử lý lỗi
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token hết hạn hoặc không hợp lệ
          return this.handle401Error(authReq, next);
        } else if (error.status === 403) {
          // Không có quyền truy cập
          console.error('Forbidden: Bạn không có quyền truy cập tài nguyên này');
          this.router.navigate(['/forbidden']).then();
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        // Hàm gọi API refresh token trong AuthService
        switchMap((newToken: any) => {
          this.isRefreshing = false;
          // this.authService.saveAuthToken(newToken.accessToken); // Lưu token mới
          this.refreshTokenSubject.next(newToken.accessToken);
          return next.handle(
            this.addToken(
              this.getNewRequestWithToken(request, newToken.accessToken),
              newToken.accessToken
            )
          );
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.removeToken();
          this.router.navigate(['/login']).then();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(res => {
          return next.handle(this.getNewRequestWithToken(request, res));
        })
      );
    }
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Code': this.authService.getBuilding(),
        'X-Role-Code': this.authService.getRoleSelect()
      }
    });
  }

  private getNewRequestWithToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        ...request.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }
}
