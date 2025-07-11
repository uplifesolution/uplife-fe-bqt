import { Complaint } from '@/features/complaints/interfaces/complaint';
import { PageableParams } from '@/core/interfaces/pageable-param';

export interface ComplaintSearch
  extends Omit<Complaint, 'id' | 'complaintAt' | 'categoryName'>,
    PageableParams {
  complaintFrom: string;
  complaintTo: string;
  categoryId: string;
}
