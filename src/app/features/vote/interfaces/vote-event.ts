
export interface VoteEvent {
  maxVotePerApartment: number;
  numberOfWinners: number;
  description?: string;
  apartmentCodes: any;
  id: number;
  buildingId?: number;
  name: string;
  type: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  votingEventTypeDTO?: {
    name: string;
    code: string;
  };
  voteDTOs?: ApartmentVote[];
  statusDTO?: {
    name: string;
    code: string;
  };
  googleFormLink?: string;
  content?: string;
  isAllApartment?: boolean;
}


export interface ApartmentVote {
  apartmentCode: string;
}
