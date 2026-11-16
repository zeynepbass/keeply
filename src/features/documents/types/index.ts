export const DOCUMENT_TYPES = ['receipt', 'invoice', 'warranty', 'contract', 'other'] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface Document {
  id: string;
  productId: string | null;
  serviceRecordId: string | null;
  type: DocumentType;
  name: string;
  uri: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export type Receipt = Document & { type: 'receipt' };

export type Invoice = Document & { type: 'invoice' };

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
}

export interface DocumentInput {
  file: PickedFile;
  type: DocumentType;
  name: string;
  productId: string | null;
  serviceRecordId?: string | null;
}
