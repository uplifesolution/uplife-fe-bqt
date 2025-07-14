import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Utils } from '@/helpers/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const functionCode = route.data['code'];
    const actions = this.authService
      .getFunctionOfUser()
      .find(item => item.code == functionCode)?.actions;
    if (functionCode && (!this.authService.hasToken() || Utils.isEmpty(actions))) {
      this.router.navigate(['/']).then();
      return false;
    }
    return true;
  }
}
