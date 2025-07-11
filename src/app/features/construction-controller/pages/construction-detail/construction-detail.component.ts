import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { BaseComponent } from '@/shared/components/base.component';
import { Constants } from '@/helpers/constants';
import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { ConstructionCreateComponent } from '../../components';
import { Category } from '@/features/common-category/interfaces/category';
import { DropList } from '@/core/interfaces/droplist';
import { ConstructionController } from '../../interfaces/construction-controller';
import { ConstructionService } from '@/core/services/construction.service';
import { finalize } from 'rxjs';
import { EcmFolderComponent } from '@/shared/components';

@Component({
  selector: 'construction-detail',
  imports: [SharedModule, Drawer, ConstructionCreateComponent, Button, EcmFolderComponent],
  standalone: true,
  templateUrl: './construction-detail.component.html',
  styleUrl: './construction-detail.component.scss'
})
export class ConstructionDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('formEdit') formEdit?: ConstructionCreateComponent;
  service = inject(ConstructionService);
  data?: ConstructionController;
  visibleEdit = false;

  listStatus: DropList<Category> = {
    loading: true,
    data: []
  };

  listPriorityLevel: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit(): void {
    this.loadingService.start();
    this.initPermission();
    const id = this.route.snapshot.params[Constants.FieldId];
    this.commonService.getCategoryByCode(Constants.DropList_CommonStatus).subscribe({
      next: data => {
        this.listStatus = {
          loading: false,
          data
        };
      }
    });
    this.commonService.getCategoryByCode(Constants.DropList_PriorityLevel).subscribe({
      next: data => {
        this.listPriorityLevel = {
          loading: false,
          data
        };
      }
    });
    if (id) {
      this.getDetail(id);
    }
  }

  getDetail(id: number) {
    this.loadingService.start();
    this.service
      .getById(id)
      .pipe(finalize(() => this.loadingService.complete()))
      .subscribe({
        next: data => {
          this.data = data;
        }
      });
  }

  openFormEdit() {
    if (this.data) {
      this.visibleEdit = true;
      const data = { ...this.data };
      this.formEdit?.pathValue(data);
    }
  }

  onChangeData(data: ConstructionController) {
    this.getDetail(data?.id);
  }
}
