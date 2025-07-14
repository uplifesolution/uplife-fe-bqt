import { Category } from "@/features/common-category/interfaces/category";
import { Nullable } from "primeng/ts-helpers";

export interface PolicyRule {
  ackRequired: boolean;
  active: boolean;
  activeName: string;
  applicableTo?: string;
  approvedBy: string;
  rejectBy?: string;
  reason: string;
  approvedDate: string;
  attachments: string;
  content: string;
  effectiveDate: string;
  expiredDate: string;
  id: number;
  note: string;
  status: string;
  statusName: string;
  title: string;
  type: Nullable<string>;
  typeName: string;
  version: number;
  uuidEcmFolder?: string;
  typeDTO?: Category;
  statusDTO?: Category;
  policyRuleFunctionDTOS?: FunctionDTOS[];
  policyRuleId?: number;
}

export interface FunctionDTOS {
  id: number;
  functionId: number;
}

export interface TableFunctions {
  id: number;
  code: string;
  name: string;
  checked?: boolean;
}

export interface PolicyRuleApprove {
  note: string;
  status: string;
  policyRuleId: number;
}
