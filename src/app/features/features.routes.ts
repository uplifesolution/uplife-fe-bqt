import { Routes } from '@angular/router';
import { AuthGuard } from '@/core/guards/auth.guard';
import { AppMainComponent } from '@/shared/layout/app.main.component';
import { Constants } from '@/helpers/constants';

export const routes: Routes = [
  {
    path: '',
    component: AppMainComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@/features/dashboard/dashboard.component').then(c => c.DashboardComponent),
        data: {
          code: Constants.Function.FunctionManagement,
          breadcrumb: 'dashboard'
        }
        // canActivate: [AuthGuard]
      },
      {
        path: 'resident',
        loadChildren: () => import('@/features/residents/routes').then(r => r.routes),
        data: {
          code: Constants.Function.ResidentManagement,
          breadcrumb: 'resident'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'building',
        loadChildren: () => import('@/features/buildings/routes').then(r => r.routes),
        data: {
          code: Constants.Function.BuildingManagement,
          breadcrumb: 'buildingManagement'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'apartment',
        loadChildren: () => import('@/features/apartments/routes').then(r => r.routes),
        data: {
          code: Constants.Function.ApartmentManagement,
          breadcrumb: 'apartment'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'construction-management',
        loadChildren: () => import('@/features/construction-controller/routes').then(r => r.routes),
        data: {
          code: Constants.Function.ConstructionManagement,
          breadcrumb: 'constructionList'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'policy-rule',
        loadChildren: () => import('@/features/policy-rule/routes').then(m => m.routes),
        data: {
          code: Constants.Function.PolicyRuleManagement,
          breadcrumb: 'policyRule'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'committees-management',
        loadChildren: () => import('@/features/committees-management/routes').then(r => r.routes),
        data: {
          code: Constants.Function.CommitteeManagement,
          breadcrumb: 'committeeManagement'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'notify/vote',
        loadChildren: () => import('@/features/vote/routes').then(r => r.routes),
        data: {
          code: Constants.Function.VotingEventManagement,
          breadcrumb: 'votingEvent'
        },
        canActivate: [AuthGuard]
      }
    ]
  }
];
