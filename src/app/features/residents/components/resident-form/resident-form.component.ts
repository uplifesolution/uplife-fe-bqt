import { Component, EventEmitter, inject, Output } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { FormGroup } from '@angular/forms';
import { BaseComponent } from '@/shared/components/base.component';
import { Resident } from '@/features/residents/interfaces/resident';
import { finalize } from 'rxjs';
import { ResidentService } from '@/core/services/resident.service';

@Component({
  selector: 'resident-form',
  imports: [SharedModule],
  standalone: true,
  templateUrl: './resident-form.component.html',
  styleUrl: './resident-form.component.scss'
})
export class ResidentFormComponent extends BaseComponent {
  @Output() changeData = new EventEmitter<Resident>();
  service = inject(ResidentService);
  form = new FormGroup({});
  loading = false;

  onSave() {
    if (!this.loading) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
      } else {
        this.loadingService.start();
        const data = this.form.getRawValue() as Resident;
        if (data.id) {
          this.service
            .update(data, data.id)
            .pipe(finalize(() => (this.loadingService.complete())))
            .subscribe({
              next: () => {
                this.message.success('message.success');
                this.changeData.emit(data);
              },
              error: e => {
                this.message.error(`message.${e?.error?.errorCode}`);
              }
            });
        } else {
          this.service
            .create(data)
            .pipe(finalize(() => (this.loadingService.complete())))
            .subscribe({
              next: () => {
                this.message.success('message.success');
                this.changeData.emit(data);
                this.form.reset();
              },
              error: e => {
                this.message.error(`message.${e?.error?.errorCode}`);
              }
            });
        }
      }
    }
  }

  pathValueForm(data: Resident) {
    this.form.patchValue(data);
  }
}
