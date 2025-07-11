import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Column } from '@/core/interfaces/data-table';
import { AuthService } from '@/core/guards/auth.service';
import { SharedModule } from '@/shared/shared.module';

@Component({
  selector: 'app-base-list',
  standalone: true,
  imports: [SharedModule, TableModule, ButtonModule, TooltipModule],
  templateUrl: './base-list.component.html',
  styleUrls: ['./base-list.component.scss'],
  providers: [DatePipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush // Cân nhắc dùng OnPush
})
export class BaseListComponent<T extends { id?: any }> implements OnInit, OnChanges {
  @Input() data: T[] = [];
  @Input() columns: Column[] = [];
  @Input() totalRecords: number = 0;
  @Input() lazy: boolean = true;
  @Input() loading: boolean = false;
  @Input() dataKey: string = 'id';
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 20, 50, 100];
  @Input() showCurrentPageReport: boolean = true;
  @Input() currentPageReportTemplate: string =
    'Hiển thị {first} đến {last} của {totalRecords} bản ghi';

  // @Input() rowActions: ActionDefinition<T>[] = [];
  @Input() actionsColumnHeader: string = 'Hành động';
  @Input() actionsColumnWidth: string = 'auto';
  @Input() actionsColumnFrozen: boolean = false;
  @Input() actionsColumnFrozenAlign: 'left' | 'right' = 'right';

  @Input() customHeaderTemplateRef?: TemplateRef<any>;
  @Input() customActionsTemplateRef?: TemplateRef<{ $implicit: T; rowData: T }>;
  @Input() customEmptyMessageTemplateRef?: TemplateRef<any>;
  @Input() customRowExpansionTemplateRef?: TemplateRef<{ $implicit: T; rowData: T }>;

  @Output() onLazyLoad = new EventEmitter<TableLazyLoadEvent>();

  // Không cần output các action cụ thể nữa nếu component cha xử lý qua callback của ActionDefinition
  // @Output() viewDetails = new EventEmitter<T>();
  // @Output() editItem = new EventEmitter<T>();
  // @Output() deleteItem = new EventEmitter<T>();

  @ViewChild('pTable', { static: false }) pTable!: Table;

  private authService = inject(AuthService);

  // _effectiveRowActions: ActionDefinition<T>[] = [];
  _visibleColumns: Column[] = [];

  ngOnInit(): void {
    this.updateDependencies();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['rowActions']) {
      this.updateDependencies();
    }
  }

  private updateDependencies(): void {
    this.updateVisibleColumns();
    this.updateEffectiveActions();
  }

  updateVisibleColumns(): void {
    this._visibleColumns = this.columns.filter(col => this.canShowColumn(col));
  }

  updateEffectiveActions(): void {
    // if (this.customActionsTemplateRef) {
    //   this._effectiveRowActions = []; // Cha sẽ quản lý template tùy chỉnh
    //   return;
    // }
    // this._effectiveRowActions = this.rowActions.filter(action => this.canShowAction(action));
  }

  canShowColumn(col: Column): boolean {
    return !col.hidden;
    // if (!col.permission) return true;
    // return this.authService.hasAnyPermission(
    //   Array.isArray(col.permission) ? col.permission : [col.permission]
    // );
  }

  // canShowAction(action: ActionDefinition<T>, rowData?: T): boolean {
  //   const hasPermission = action.permission
  //     ? this.authService.hasAnyPermission(
  //         Array.isArray(action.permission) ? action.permission : [action.permission]
  //       )
  //     : true;
  //   if (!hasPermission) return false;
  //   return action.visible ? action.visible(rowData!) : true;
  // }

  // isActionDisabled(action: ActionDefinition<T>, rowData: T): boolean {
  //   return action.disabled ? action.disabled(rowData!) : false;
  // }

  shouldShowActionsColumn(): boolean {
    return true;
    // if (this.customActionsTemplateRef) return true;
    // return this._effectiveRowActions.length > 0;
  }

  handleLazyLoad(event: TableLazyLoadEvent): void {
    if (this.lazy) {
      this.onLazyLoad.emit(event);
    }
  }

  public refresh(event?: Partial<TableLazyLoadEvent>): void {
    if (!this.pTable) {
      console.warn('pTable instance not available for refresh.');
      return;
    }
    const currentTableState = this.pTable.createLazyLoadMetadata();
    const eventToEmit: TableLazyLoadEvent = {
      ...currentTableState,
      ...event
    };
    if (event && event.first !== undefined) {
      this.pTable.first = event.first; // Quan trọng để UI table đồng bộ
    }
    this.handleLazyLoad(eventToEmit);
  }

  getNestedValue(obj: any, path: string): any {
    if (!path || !obj) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  formatCellData(value: any, column: Column, rowData: T): string {
    if (column.format) {
      return column.format(value, rowData);
    }
    if (value === null || value === undefined) return '';

    const datePipe = new DatePipe('en-US'); // Hoặc 'vi-VN'
    const currencyPipe = new CurrencyPipe('en-US'); // Hoặc 'vi-VN'

    switch (column.dataType) {
      case 'date':
        return datePipe.transform(value, 'dd/MM/yyyy HH:mm') || value.toString();
      case 'currency':
        return currencyPipe.transform(value, 'VND', 'symbol', '1.0-0', 'vi') || value.toString();
      case 'boolean':
        return value ? 'Có' : 'Không';
      default:
        return value.toString();
    }
  }

  // executeAction(actionDefinition: ActionDefinition<T>, rowData: T): void {
  //   actionDefinition.action(rowData);
  // }

  // HÀM HELPER MỚI CHO NGCLASS
  getHeaderClasses(col: Column): string[] {
    const classes: string[] = [];
    if (col.styleClass) classes.push(col.styleClass);
    if (col.headerStyleClass) classes.push(col.headerStyleClass);
    return classes;
  }

  getBodyCellClasses(col: Column): string[] {
    const classes: string[] = [];
    if (col.styleClass) classes.push(col.styleClass);
    if (col.bodyStyleClass) classes.push(col.bodyStyleClass);
    return classes;
  }
}
