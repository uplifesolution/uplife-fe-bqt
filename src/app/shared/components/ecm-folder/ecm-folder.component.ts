import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { Tree, TreeNodeExpandEvent } from 'primeng/tree';
import { MenuItem, TreeNode } from 'primeng/api';
import { Constants } from '@/helpers/constants';
import { FileService } from '@/core/services/file.service';
import { EcmFolder } from '@/core/interfaces/ecm-folder';
import { finalize } from 'rxjs';
import { ContextMenu } from 'primeng/contextmenu';
import { environment } from '../../../../environments/environment';
import { NotificationMessageService } from '@/core/services/message.service';
import { Dialog } from 'primeng/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingService } from '@/core/services/loading.service';

@Component({
  selector: 'ecm-folder',
  imports: [SharedModule, Tree, ContextMenu, Dialog],
  standalone: true,
  templateUrl: './ecm-folder.component.html',
  styleUrl: './ecm-folder.component.scss'
})
export class EcmFolderComponent implements OnInit {
  @ViewChild('elFile') elFile?: ElementRef;

  @Input() set uuidEcmFolder(uuid: string) {
    if (uuid) {
      this.getEcmTreeFolder(uuid);
      this._uuid = uuid;
    }
  }

  fileService = inject(FileService);
  message = inject(NotificationMessageService);
  sanitizer = inject(DomSanitizer);
  loadingService = inject(LoadingService);
  _uuid!: string;
  loading = true;
  files: TreeNode[] = [];
  selected: TreeNode | null = null;
  menuItems: MenuItem[] = [];
  file: any;
  visible: boolean = false;

  ngOnInit() {}

  onNodeContextMenuSelect(event: { node: TreeNode }) {
    this.selected = event.node;

    this.menuItems = [
      {
        label: 'button.reload',
        icon: 'pi pi-refresh',
        visible: this.selected?.type === Constants.Ecm.Folder,
        command: event => this.onReload()
      },
      {
        label: 'button.uploadFile',
        icon: 'pi pi-upload',
        visible: this.selected?.type === Constants.Ecm.Folder,
        command: event => this.onUpload()
      },
      {
        label: 'button.view',
        icon: 'pi pi-eye',
        visible: this.selected?.type === Constants.Ecm.File,
        command: event => this.onViewFile()
      },
      {
        label: 'button.download',
        icon: 'pi pi-download',
        visible: this.selected?.type === Constants.Ecm.File,
        command: event => this.onDownload()
      }
    ];
  }

  onNodeDoubleClick(event: { node: TreeNode }) {
    if (event.node.type === 'File') {
      this.selected = event.node;
      this.onViewFile();
    }
  }

  getEcmTreeFolder(uuid: string) {
    this.fileService
      .getEcmFolder(uuid)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: data => {
          this.files = this.mapEcmTreeToTreeNode([data]);
          if (this.files[0]) {
            this.files[0].expanded = true;
            this.files[0].data.fetched = true;
          }
        }
      });
  }

  mapEcmTreeToTreeNode(nodes: EcmFolder[]): TreeNode[] {
    return nodes.map(node => {
      const folderChildren = this.mapEcmTreeToTreeNode(node.children || []);
      const fileChildren: TreeNode[] = (node.files || []).map(file => ({
        label: file.fileName,
        data: file,
        type: Constants.Ecm.File,
        leaf: true,
        key: file.uuid,
        icon: this.getFileIconClassName(file.fileName),
        styleClass: 'file-node-content'
      }));

      return {
        label: node.name,
        data: node,
        type: Constants.Ecm.Folder,
        expandedIcon: 'ecm-folder-open',
        collapsedIcon: 'ecm-folder',
        children: [...folderChildren, ...fileChildren],
        key: node.uuid,
        leaf: false
      };
    });
  }

  onNodeExpand(event: TreeNodeExpandEvent) {
    if (event.node.type === Constants.Ecm.Folder && !event.node.data.fetched) {
      event.node.loading = true;
      this.fileService
        .getEcmFolder(event.node.data.uuid)
        .pipe(finalize(() => (event.node.loading = false)))
        .subscribe({
          next: data => {
            event.node.children = this.mapEcmTreeToTreeNode([data])[0].children;
            event.node.data.fetched = true;
          }
        });
    }
  }

  private onUpload() {
    if (this.loadingService.loading) {
      return;
    }
    this.elFile?.nativeElement.click();
  }

  private onDownload() {
    if (this.loadingService.loading) {
      return;
    }
    this.loadingService.start();
    const url = `${environment.baseUrl}/ecm/investors/files/${this.selected?.key}/download`;
    this.fileService
      .downloadFile(url)
      .pipe(finalize(() => this.loadingService.complete()))
      .subscribe({
        next: () => {},
        error: error => {
          this.message.error(`message.${error?.error?.errorCode}`);
        }
      });
  }

  private onViewFile() {
    if (this.loadingService.loading) {
      return;
    }
    if (this.selected?.data?.urlPreview) {
      this.visible = true;
    } else {
      this.loadingService.start();
      this.fileService
        .getUrlPreviewFile(this.selected?.key!)
        .pipe(finalize(() => this.loadingService.complete()))
        .subscribe(url => {
          this.selected!.data.urlPreview = url; // giữ lại string
          this.selected!.data.safeUrlPreview = this.sanitizer.bypassSecurityTrustResourceUrl(url); // thêm biến mới
          this.visible = true;
        });
    }
  }

  onChooseFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && this.selected?.key) {
      this.loadingService.start();
      this.fileService
        .uploadFileEcm(this.selected.key, file)
        .pipe(finalize(() => this.loadingService.complete()))
        .subscribe({
          next: () => {
            this.message.success('message.success');
          },
          error: error => {
            this.message.error(`message.${error?.error?.errorCode}`);
          }
        });
    }
  }

  private onReload() {
    if (this.selected?.type === Constants.Ecm.Folder) {
      this.selected!.expanded = false;
      this.selected!.loading = true;
      this.fileService
        .getEcmFolder(this.selected!.key!)
        .pipe(finalize(() => (this.selected!.loading = false)))
        .subscribe({
          next: data => {
            this.selected!.children = this.mapEcmTreeToTreeNode([data])[0].children;
            this.selected!.data.fetched = true;
            this.selected!.expanded = true;
          }
        });
    }
  }

  getFileIconClassName(fileName: string): string {
    if (!fileName) return 'ecm-file-unknown';

    const ext = fileName.split('.').pop()?.toLowerCase()!;
    // Gom nhóm extension
    const extensionMap: { [key: string]: string } = {
      doc: 'doc',
      docx: 'doc',
      xls: 'excel',
      xlsx: 'excel',
      csv: 'xsl',
      pdf: 'pdf',
      ppt: 'ppt',
      jpg: 'img',
      jpeg: 'img',
      png: 'img',
      gif: 'img',
      mp3: 'mp3',
      mp4: 'mp4',
      mov: 'mp4',
      avi: 'mp4',
      mkv: 'mp4',
      html: 'html',
      htm: 'html',
      exe: 'exe',
      rar: 'rar',
      zip: 'rar'
    };

    const mappedExt = extensionMap[ext];

    return mappedExt ? `ecm-file-${mappedExt}` : 'ecm-file-unknown';
  }

  isPdf(url: string | null | undefined): boolean {
    return typeof url === 'string' && url.toLowerCase().includes('.pdf');
  }

  isImage(url: string | null | undefined): boolean {
    if (!url) return false;
    const urlWithoutQuery = url.split('?')[0]; // bỏ phần sau dấu ?
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(urlWithoutQuery);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url.split('?')[0] || '');
  }

  isAudio(url: string): boolean {
    return /\.(mp3|wav|ogg|m4a)$/i.test(url);
  }
}
