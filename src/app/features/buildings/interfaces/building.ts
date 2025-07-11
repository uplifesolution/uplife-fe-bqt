import { Category } from '@/features/common-category/interfaces/category';
import { Board } from '@/features/management-board/interfaces/board';

export interface Building {
  id: number;
  name: string;
  code: string;
  address: string;
  numFloors: number;
  numApartments: number;
  parkingSlotCar: number;
  parkingSlotMotorBike: number;
  parkingSlotBike: number;
  hasResidentCard: boolean;
  isAuto: boolean;
  managementBoard: Board;
  statusCode: string;
  status: Category;
  activeDate: string;
  provinceCode: string;
  province: Category;
  district: Category;
  wardCode: string;
  ward: Category;
  uuidEcmFolder: string;
  services?: [];
}

export interface BuildingServicesContent {
  id?: number;
  serviceName?: string;
  quantity?: number;
}
