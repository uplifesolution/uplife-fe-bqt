export interface Complaint {
  id: string;
  apartmentCode: string;
  residentName: string;
  priority: string;
  priorityLabel: string;
  status: string;
  subject: string;
  assignedName: string;
  categoryName: string;
  avgRating: number;
  description: string;
  resolutionNote: string;
  uuidEcmFolder: string;
  allowReassign: boolean;
  histories: {
    action: string;
    performedAt: string;
    performedBy: string;
  }[];
  steps: {
    status: string;
    statusLabel: string;
    approvalStatus: string;
    actions: {
      code: string;
      label: string;
    }[];
  }[];
  residentDto: {
    uuid: string;
    apartmentUuid: string;
    apartmentNumber: string;
    buildingBlock: string;
    fullName: string;
    phoneNumber: string;
  };
  assignedDto: {
    id: number;
    code: string;
    fullName: string;
    phoneNumber: string;
    positionName: string;
    technicianTypeLabel: string;
  };
}
