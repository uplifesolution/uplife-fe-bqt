import { Routes } from '@angular/router';
import { ResidentDetailComponent, ResidentListComponent } from '@/features/residents/pages';

export const routes: Routes = [
  {
    path: '',
    component: ResidentListComponent
  },
  {
    path: ':id',
    component: ResidentDetailComponent,
    data: {
      breadcrumb: 'residentDetail'
    }
  }
];
