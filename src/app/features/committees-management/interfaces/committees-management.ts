export interface Committees {
  id: number;
  fullName: string;
  phone: string;
  titleDTO?: {
    id: number;
    name: string;
  };
  buildingDTO?: {
    id: number;
  }
  apartmentDTO?: {
    apartmentNumber: string;
    uuid: string;
  };
  activeName?: string;
  active?: boolean;
  startDate: string;
  endDate?: string;
  isRepresentative: boolean;
  isPrimaryRepresentative: boolean;
  biography: string;
  buildingId: number;
  uuidEcmFolder?: string;
}
