import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { SafeUrl } from '@angular/platform-browser';
import { SharedModule } from '@/shared/shared.module';

@Component({
  selector: 'img-cropper',
  imports: [SharedModule, Dialog, Button, ImageCropperComponent],
  standalone: true,
  templateUrl: './img-cropper.component.html',
  styleUrl: './img-cropper.component.scss'
})
export class ImgCropperComponent {
  @Output() imageChanged = new EventEmitter<{ blob: Blob; objectUrl: string }>();
  @Input() showChangeImage: boolean = true;
  @Input() imageUrl: SafeUrl | string = ''; // Ảnh hiện tại
  @Input() imgWidth: string = '17rem';
  @Input() imgHeight: string = '17rem';
  @Input() cropperStaticWidth = 200;
  @Input() cropperStaticHeight = 200;
  @Input() cropperMinWidth = 0;
  @Input() cropperMinHeight = 0;
  @Input() cropperMaxWidth = 0;
  @Input() cropperMaxHeight = 0;
  @Input() resizeToWidth = 300;

  showCropper: boolean = false;
  imageChangedEvent: any = '';
  croppedImage?: ImageCroppedEvent;
  transform: ImageTransform = {
    translateUnit: 'px',
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0
  };

  openCropper(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event;
  }

  onSave(): void {
    if (!this.croppedImage) return;
    const { blob, objectUrl } = this.croppedImage;

    this.imageChanged.emit({ blob: blob!, objectUrl: objectUrl! });
    this.showCropper = false;
  }

  onCancel(): void {
    this.showCropper = false;
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  zoomOut() {
    this.transform = {
      ...this.transform,
      scale: this.transform.scale! - 0.1
    };
  }

  zoomIn() {
    this.transform = {
      ...this.transform,
      scale: this.transform.scale! + 0.1
    };
  }

  reset() {
    // this.canvasRotation = 0;
    // this.cropper = undefined;
    // this.maintainAspectRatio = false;
    this.transform = {
      translateUnit: 'px',
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      translateH: 0,
      translateV: 0
    };
  }
}
