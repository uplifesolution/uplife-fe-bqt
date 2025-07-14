import { Routes } from '@angular/router';
import { Constants } from '@/helpers/constants';
import { VoteDetailComponent, VoteListComponent } from './pages';

export const routes: Routes = [
  {
    path: '',
    component: VoteListComponent
  },
  {
    path: `:${Constants.FieldId}`,
    component: VoteDetailComponent,
    data: {
      breadcrumb: 'votingEventDetail'
    }
  }
];
