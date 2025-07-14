import { FunctionApp } from '@/features/functions/interfaces/function';
import { Building } from '@/features/buildings/interfaces/building';

export interface Auth {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
}

export interface UserAuthInfo {
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roles: RoleUserAuth[];
  id: number;
  isAgreementPolicy: boolean;
  phoneNumber: string;
  avatarUrl: string;
}

export interface RoleUserAuth {
  code: string;
  id: number;
  name: string;
  buildings: Building[];
  functions: (FunctionApp & { permissions: PermissionAuth[]; actions: string[] })[];
}

export interface PermissionAuth {
  id: number;
  code: string;
  name: string;
}
