export interface ConstructionController {
  apartmentId?: string | number;
  apartmentCode?: string;
  apartmentNumber?: string;
  apartmentFloor?: number;
  apartmentOwner?: string;
  ownerPhone?: string;
  id: number;
  buildingId?: number;
  statusLabel?: string;
  buildingBlock?: string;
  floor?: number;
  area?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  noiseLevel?: string;
  workDescription?: string;
  uuidEcmFolder?: string;
  apartmentDTO?: {
    id?: string;
    type?: string;
    apartmentCode?: string;
    apartmentNumber?: string;
    floor?: number;
    area?: number;
    statusLabel?: string;
    buildingBlock?: string;
    ownerDTO?: {
      fullName?: string;
      phoneNumber?: string;
    };
    uuidEcmFolder?: string;
  };
}
