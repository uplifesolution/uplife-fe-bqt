import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';
import { GetLabelPipe } from '@/shared/pipes';
import { RippleModule } from 'primeng/ripple';

const MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  TranslateModule,
  SkeletonModule,
  RippleModule
];
const PIPES = [GetLabelPipe];

@NgModule({
  imports: [...MODULES, ...PIPES],
  exports: [...MODULES, ...PIPES],
  providers: [DialogService]
})
export class SharedModule {}
