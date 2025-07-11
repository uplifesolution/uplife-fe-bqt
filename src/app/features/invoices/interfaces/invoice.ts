import { Apartment } from '@/features/apartments/interfaces/apartment';

export interface Invoice {
  id: number;
  buildingCode: string;
  buildingName: string;
  apartment: Apartment;
  ownerName: string;
  ownerId: string;
  address: string;
  status: string;
  statusName: string;
  invoiceStatus: string;
  invoiceStatusName: string;
  dueDate: string;
  period: string;
  invoiceName: string;
  invoiceCode: string;
  total: number;
  totalByWord: string;
  qrCode: string;
  description: string;
  uuidEcmFolder: string;
  details: ItemOfInvoice[];
}

export interface ItemOfInvoice {
  id: number;
  invoiceName: string;
  totalConsumption: number;
  unitPrice: string;
  totalAmount: number;
  description: string;
  invoiceCode: string;
  period: string;
  startReading: number;
  endReading: number;
}

export interface InvoiceStatistic {
  totalElectricity: number;
  totalInvoices: number;
  totalMaintenance: number;
  totalOther: number;
  totalPaidElectricity: number;
  totalPaidInvoices: number;
  totalPaidMaintenance: number;
  totalPaidOther: number;
  totalPaidSummary: number;
  totalPaidVehicle: number;
  totalPaidWater: number;
  totalSummary: number;
  totalVehicle: number;
  totalWater: number;
}
