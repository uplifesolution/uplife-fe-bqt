import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { BaseComponent } from '@/shared/components/base.component';
import { Constants } from '@/helpers/constants';
import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { Committees } from '../../interfaces/committees-management';
import { CommitteeManagementService } from '@/core/services/committees-management.service';
import { CommitteeCreateComponent } from '../../components';
import { finalize } from 'rxjs';
import { EcmFolderComponent } from '@/shared/components';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'committees-management-detail',
  imports: [SharedModule, Drawer, CommitteeCreateComponent, Button, EcmFolderComponent, RouterLink],
  standalone: true,
  templateUrl: './committees-management-detail.component.html',
  styleUrl: './committees-management-detail.component.scss'
})
export class CommitteeManagementDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('formEdit') formEdit?: CommitteeCreateComponent;
  service = inject(CommitteeManagementService);
  data?: Committees;
  visibleEdit = false;

  ngOnInit(): void {
    this.initPermission();
    const id = this.route.snapshot.params[Constants.FieldId];
    if (id) {
      this.getDetail(id);
    }
  }

  getDetail(id: number) {
    this.loadingService.start();
    this.service.getById(id)
      .pipe(finalize(() => (this.loadingService.complete())))
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

  onChangeData(data: Committees) {
    this.getDetail(data.id);
  }
}
