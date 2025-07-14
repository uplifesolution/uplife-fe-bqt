import { Resident } from '@/features/residents/interfaces/resident';

export interface Apartment {
  disabled: boolean;
  id: string;
  buildingBlock: string;
  apartmentCode: string;
  apartmentNumber: string;
  floor: number;
  area: number;
  status: string;
  statusLabel: string;
  hasOwner: boolean;
  ownerDTO: Resident;
  uuidEcmFolder: string;
}
