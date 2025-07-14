import { Routes } from '@angular/router';
import { AuthGuard } from '@/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/features.routes').then(f => f.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/layout/login/login.component').then(c => c.LoginComponent)
  }
];
