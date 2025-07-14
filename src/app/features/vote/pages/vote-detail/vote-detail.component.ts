import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { BaseComponent } from '@/shared/components/base.component';
import { Constants } from '@/helpers/constants';
import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { VoteCreateComponent } from '../../components';
import { VoteEvent } from '../../interfaces/vote-event';
import { VoteService } from '@/core/services/vote.service';
import { Category } from '@/features/common-category/interfaces/category';
import { DropList } from '@/core/interfaces/droplist';

@Component({
  selector: 'vote-detail',
  imports: [SharedModule, Drawer, VoteCreateComponent, Button],
  standalone: true,
  templateUrl: './vote-detail.component.html',
  styleUrl: './vote-detail.component.scss'
})
export class VoteDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('formEdit') formEdit?: VoteCreateComponent;
  service = inject(VoteService);
  data?: VoteEvent;
  visibleEdit = false;

  listVotingType: DropList<Category> = {
    loading: true,
    data: []
  };

  ngOnInit(): void {
    this.initPermission();
    const id = this.route.snapshot.params[Constants.FieldId];
    this.commonService.getCategoryByCode(Constants.DropList_VotingEventType).subscribe({
      next: data => {
        this.listVotingType = {
          loading: false,
          data
        };
      }
    });
    if (id) {
      this.getDetail(id);
    }
  }

  openGoogleForm(link: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }

  getDetail(id: number) {
    this.loadingService.start();
    this.service.getById(id).subscribe({
      next: data => {
        this.data = data;
        this.loadingService.complete();
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

  sendVote() {
    this.message.confirm().subscribe((isConfirm: boolean) => {
      if (isConfirm) {
        this.service.startVotingEvent(this.data?.id!, {} as VoteEvent).subscribe({
          next: () => {
            this.message.success('message.success');
            const id = this.route.snapshot.params[Constants.FieldId];
            this.getDetail(id);
          },
          error: e => {
            this.message.error(`message.${e?.error?.errorCode}`);
          }
        });
      }
    });
  }

  onChangeData(data: VoteEvent) {
    this.getDetail(data.id!);
  }
}
