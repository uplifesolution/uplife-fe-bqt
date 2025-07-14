import { PageableParams } from '@/core/interfaces/pageable-param';

export interface InvoiceSearch extends PageableParams {
  buildingCode?: string;
}
