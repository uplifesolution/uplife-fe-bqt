import { Building } from '@/features/buildings/interfaces/building';
import { SafeUrl } from '@angular/platform-browser';

export interface Board {
  id: number;
  code: string;
  name: string;
  active: boolean;
  activeName: string;
  startDate: string;
  hotline: string;
  representativeName: string;
  buildingDTOs: Building[];
  buildingIds: number[];
  uuidEcmFolder: string;
  logoUuid: string;
  logoUrl: string | SafeUrl;
  ecmLogoFolderUuid: string;
  averageRating: number;
}
