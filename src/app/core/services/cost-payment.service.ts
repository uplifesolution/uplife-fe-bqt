import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchableService } from '@/core/services/base.service';
import { CostPayment } from '@/features/service-management/interfaces/cost-payment';
import { CostPaymentSearch } from '@/features/service-management/interfaces/cost-payment-search';

@Injectable({
  providedIn: 'root'
})
export class CostPaymentService extends SearchableService<
  CostPaymentSearch,
  CostPayment,
  CostPayment
> {
  override baseUrl: string = `${environment.baseUrl}/service-cost-payment`;
}
