import { Routes } from '@angular/router';
import { Constants } from '@/helpers/constants';
import { BuildingDetailComponent, BuildingListComponent } from '@/features/buildings/pages';

export const routes: Routes = [
  {
    path: '',
    component: BuildingListComponent
  },
  {
    path: `:${Constants.FieldId}`,
    component: BuildingDetailComponent,
    data: { breadcrumb: 'buildingInfo' }
  }
];
