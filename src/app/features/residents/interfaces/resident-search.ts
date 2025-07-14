import { PageableParams } from '@/core/interfaces/pageable-param';

export interface ResidentSearch extends PageableParams {
  fullName: string;
  phoneNumber: string;
}
