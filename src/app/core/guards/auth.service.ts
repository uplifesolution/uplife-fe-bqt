import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Auth, RoleUserAuth, UserAuthInfo } from '@/core/interfaces/auth';
import { Building } from '@/features/buildings/interfaces/building';
import { ResponseApi } from '@/core/interfaces/response-api';
import { Constants } from '@/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.baseUrl}/auth`; // API login
  private tokenKey = 'uplife_access_token';
  private refreshKey = 'uplife_refresh_token';
  private usernameKey = 'uplife_username_id';
  private listBuilding: Building[] = [];
  private user!: UserAuthInfo;
  private roleSelected!: RoleUserAuth;
  private rolesUser: RoleUserAuth[] = [];
  private buildingSubject = new BehaviorSubject<string>('');
  building$ = this.buildingSubject.asObservable(); // public observable để component khác subscribe

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Đăng nhập và lưu token
  login(credentials: { phoneNumber: string; password: string }): Observable<any> {
    return this.http.post<Auth>(`${this.authUrl}/login`, credentials).pipe(
      switchMap(response => {
        // Giữ token tạm thời để call API user info
        localStorage.setItem(this.tokenKey, response.accessToken);
        localStorage.setItem(this.refreshKey, response.refreshToken);
        localStorage.setItem(this.usernameKey, response.username);
        // Gọi đồng thời các API cần thiết
        return this.getUserInfoAndPermissions().pipe(
          catchError(error => {
            console.log(error);
            return of([]);
          })
        );
      })
    );
  }

  refreshToken(): Observable<Auth> {
    const refreshToken = localStorage.getItem(this.refreshKey);
    const username = localStorage.getItem(this.usernameKey);
    return this.http.post<Auth>(`${this.authUrl}/refresh`, { username, refreshToken }).pipe(
      tap(newToken => {
        localStorage.setItem(this.tokenKey, newToken.accessToken);
      })
    );
  }

  // Kiểm tra xem có token không
  hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Lấy token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Đăng xuất
  logout(): Observable<any> {
    return this.http.post(`${this.authUrl}/logout`, {}, { responseType: 'text' }).pipe(
      tap(() => {
        this.removeToken();
        this.router.navigate(['/login']).then();
      }),
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 400 &&
          error.error === '{"error":"Error during logout: Access Token has been revoked"}'
        ) {
          this.removeToken();
          this.router.navigate(['/login']).then();
        }
        return throwError(() => error);
      })
    );
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.usernameKey);
  }

  // Hàm kiểm tra trạng thái xác thực khi khởi động
  initializeAuth(): Observable<any> {
    if (this.hasToken()) {
      return this.getUserInfoAndPermissions();
    }
    return of(false);
  }

  getUserInfoAndPermissions() {
    return forkJoin({
      permissions: this.http
        .get<ResponseApi<UserAuthInfo>>(`${environment.baseUrl}/uplifer/current`)
        .pipe(
          tap(res => {
            this.user = res.data;
            this.rolesUser = res.data.roles;
            // this.roleSelected = res.data.roles[0];
            this.roleSelected =
              res.data.roles.find(item => item.code === 'MANAGER') ?? res.data.roles[0];
            this.roleSelected.functions.forEach(item => {
              item.actions = item.permissions.map(p => p.code.split('.')[1]);
            });
            this.setRoleSelect(this.roleSelected);
          })
        )
    });
  }

  setBuilding(value: string) {
    this.buildingSubject.next(value);
  }

  getBuilding() {
    return this.buildingSubject.getValue();
  }

  getListBuildingUser() {
    return this.listBuilding;
  }

  setRoleSelect(role: RoleUserAuth) {
    this.roleSelected = role;
    this.http
      .get<ResponseApi<Building[]>>(`${environment.baseUrl}/uplifer/manager/permission`)
      .pipe(
        map(res => {
          this.listBuilding = res.data;
          if ([Constants.RoleInvestor, Constants.RoleSuperAdmin].includes(this.getRoleSelect())) {
            this.buildingSubject.next('');
          } else {
            this.buildingSubject.next(this.listBuilding[0]?.code || '');
          }
        })
      )
      .subscribe();
    this.router.navigate(['/']).then();
  }

  getRoleSelect() {
    return this.roleSelected?.code ?? '';
  }

  getFunctionOfUser() {
    return this.roleSelected.functions;
  }

  getRolesOfUser() {
    return this.rolesUser;
  }

  getUserInfo() {
    return this.user;
  }
}
