import { PageableParams } from '@/core/interfaces/pageable-param';

export interface BuildingSearch extends PageableParams {
  code: string;
  name: string;
}
