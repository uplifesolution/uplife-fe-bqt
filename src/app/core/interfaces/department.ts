export interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
  parentDepartmentId: number;
  active: boolean;
  tenantId: number;
  investorId: number;
}
