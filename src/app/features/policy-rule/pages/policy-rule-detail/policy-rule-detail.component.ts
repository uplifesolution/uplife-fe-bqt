import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { BaseComponent } from '@/shared/components/base.component';
import { Constants } from '@/helpers/constants';
import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { Category } from '@/features/common-category/interfaces/category';
import { DropList } from '@/core/interfaces/droplist';
import { CommonService } from '@/core/services/common.service';
import { finalize } from 'rxjs';
import { EcmFolderComponent } from '@/shared/components';
import { PolicyRuleApproveComponent, PolicyRuleFormComponent } from '../../components';
import { PolicyRuleService } from '@/core/services/policy-rule.service';
import { PolicyRule } from '../../interfaces/policy-rule';

@Component({
  selector: 'policy-rule-detail',
  imports: [SharedModule, Drawer, PolicyRuleFormComponent, Button, EcmFolderComponent, PolicyRuleApproveComponent],
  standalone: true,
  templateUrl: './policy-rule-detail.component.html',
  styleUrl: './policy-rule-detail.component.scss'
})
export class PolicyRuleDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('formEdit') formEdit?: PolicyRuleFormComponent;
  @ViewChild('formApprove') formApprove?: PolicyRuleApproveComponent;
  @ViewChild('formReject') formReject?: PolicyRuleApproveComponent;
  service = inject(PolicyRuleService);
  data?: PolicyRule;
  visibleEdit = false;
  visibleDrawerApprove = false;
  visibleDrawerReject = false;

  listPolicyRuleType: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit(): void {
    this.loadingService.start();
    this.initPermission();
    const id = this.route.snapshot.params[Constants.FieldId];
    this.commonService.getCategoryByCode(Constants.DropList_PolicyRuleType).subscribe({
      next: data => {
        this.listPolicyRuleType = {
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

  approve() {
    this.visibleDrawerApprove = true;
    this.formApprove?.pathValue(this.data!);
  }

  reject() {
    this.visibleDrawerReject = true;
    this.formReject?.pathValue(this.data!);
  }

  onChangeData(data: PolicyRule) {
    this.getDetail(data.id!);
  }
}
