import { Routes } from '@angular/router';
import { Constants } from '@/helpers/constants';
import { CommitteeManagementDetailComponent, CommitteesManagementListComponent } from './pages';

export const routes: Routes = [
  {
    path: '',
    component: CommitteesManagementListComponent
  },
  {
    path: `:${Constants.FieldId}`,
    component: CommitteeManagementDetailComponent,
    data: {
      breadcrumb: 'committeeDetail'
    }
  }
];
