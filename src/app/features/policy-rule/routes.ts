import { Routes } from '@angular/router';
import { PolicyRuleDetailComponent, PolicyRuleListComponent } from '@/features/policy-rule/pages';

export const routes: Routes = [
  {
    path: '',
    component: PolicyRuleListComponent
  },
  {
    path: ':id',
    component: PolicyRuleDetailComponent,
    data: {
      breadcrumb: 'detailInfo'
    }
  }
];
