import { PageableParams } from '@/core/interfaces/pageable-param';

export interface ApartmentSearch extends PageableParams {
  buildingCode: string;
  apartmentCode: string;
  apartmentNumber: string;
  status?: string;
}
