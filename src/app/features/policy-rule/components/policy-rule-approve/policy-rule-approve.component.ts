import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { BaseComponent } from '@/shared/components/base.component';
import { SharedModule } from '@/shared/shared.module';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { PolicyRule } from '../../interfaces/policy-rule';
import { PolicyRuleService } from '@/core/services/policy-rule.service';

@Component({
  selector: 'policy-rule-approve',
  imports: [
    SharedModule,
    TranslatePipe,
    RadioButtonModule,
    TableModule,
    TextareaModule,
  ],
  standalone: true,
  templateUrl: './policy-rule-approve.component.html',
  styleUrl: './policy-rule-approve.component.scss'
})
export class PolicyRuleApproveComponent extends BaseComponent implements OnInit {
  @Input() type!: 'approve' | 'reject';
  @Output() changeData = new EventEmitter<PolicyRule>();
  service = inject(PolicyRuleService);

  data?: PolicyRule;

  form = new FormGroup({
    note: new FormControl(),
    policyRuleId: new FormControl(),
    status: new FormControl(),
  });

  ngOnInit() {
  }

  onSave() {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.loadingService.loading) {
      this.message.confirm().subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.loadingService.start();
          const dataForm = this.form.getRawValue() as PolicyRule;
          if (this.type === 'approve') {
            dataForm.status = 'APPROVED';
          }
          if (this.type === 'reject') {
            dataForm.status = 'REJECTED';
          }
          dataForm.policyRuleId = this.data?.id!;
          let api = this.type === 'approve' ? this.service.approvePolicy(dataForm) : this.service.rejectPolicy(dataForm);
          api.pipe(finalize(() => (this.loadingService.complete()))).subscribe({
            next: () => {
              this.message.success('message.success');
              if(!dataForm.id) {
                this.form.reset();
              }
              this.changeData.emit({
                ...dataForm,
                id: this.data?.id!,
              }) as any;
            },
            error: e => {
              this.message.error(`message.${e?.error?.errorCode}`);
            }
          });
        }
      });
    }
  }

  pathValue(data: PolicyRule) {
    this.loadingService.start();
    this.data = data;
    this.form.patchValue({
      policyRuleId: data.id
    });
    this.loadingService.complete();
  }

}
