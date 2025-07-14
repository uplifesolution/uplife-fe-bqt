import { TemplateRef } from '@angular/core';

export interface DataTable<T = any> {
  loading: boolean;
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
  first: number;
  content: T[];
  filter?: any;
}

export interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  dataType?: 'string' | 'number' | 'date' | 'currency' | 'boolean' | 'custom';
  styleClass?: string;
  headerStyleClass?: string;
  bodyStyleClass?: string;
  width?: string;
  customCellTemplate?: TemplateRef<any>;
  format?: (value: any, rowData?: any) => string;
  hidden?: boolean;
  permission?: string | string[]; // Quyền để xem cột này

  [key: string]: any;
}

//
// export interface ActionOption {
//   label: string;
//   type: string;
//   icon?: string;
//   class?: string;
// }
