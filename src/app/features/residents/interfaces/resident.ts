export interface Resident {
  id: number;
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  isOwner: boolean;
  gender: string;
  genderLabel: string;
  relationshipLabel: string;
  floor: number;
  buildingBlock: string;
  apartmentNumber: string;
  avatarUrl?: string;
  apartmentUuid: string;
  averageRating?: number;
}
