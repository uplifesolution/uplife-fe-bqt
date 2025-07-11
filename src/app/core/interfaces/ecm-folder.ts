export interface EcmFolder {
  id: number;
  parentId: number;
  name: string;
  parentName: string;
  uuid: string;
  permissions: any[];
  createdDate: string;
  creator: string;
  modifiedDate: string;
  modifier: string;
  children: EcmFolder[];
  files: EcmFile[];
  path: string;
  providerFolderId: string;
  fetched: boolean;
}

export interface EcmFile {
  id: number;
  parentId: number;
  fileName: string;
  fileSize: number;
  parentName: string;
  uuid: string;
  permissions: any[];
  createdDate: string;
  creator: string;
  modifiedDate: string;
  modifier: string;
  virtualPath: string;
  providerFolderId: string;
  mimeType: string;
  folderId: number;
}
