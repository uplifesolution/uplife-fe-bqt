import { Routes } from '@angular/router';
import { Constants } from '@/helpers/constants';
import { ApartmentDetailComponent, ApartmentListComponent } from '@/features/apartments/pages';

export const routes: Routes = [
  {
    path: '',
    component: ApartmentListComponent
  },
  {
    path: `:${Constants.FieldId}`,
    component: ApartmentDetailComponent,
    data: { breadcrumb: 'apartmentInfo' }
  }
];
