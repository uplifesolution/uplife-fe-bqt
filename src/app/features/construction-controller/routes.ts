import { Routes } from '@angular/router';
import { Constants } from '@/helpers/constants';
import { ConstructionListComponent, ConstructionDetailComponent } from './pages';

export const routes: Routes = [
  {
    path: '',
    component: ConstructionListComponent
  },
  {
    path: `:${Constants.FieldId}`,
    component: ConstructionDetailComponent,
    data: {
      breadcrumb: 'detailInfo'
    }
  }
];
