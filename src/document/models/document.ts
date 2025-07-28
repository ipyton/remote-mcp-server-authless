export interface FileMetadata {
  path: string;
  name: string;
  description?: string;
  fileType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  documentId?: string;
  path: string;
  content: Record<string, any>;
  metadata: FileMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentResponse {
  documentId: string;
  path: string;
  metadata: FileMetadata;
}

export interface FileListResponse {
  files: FileMetadata[];
  count: number;
}

export interface DocumentQuery {
  path?: string;
  documentId?: string;
} 