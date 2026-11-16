export type ActivityKind =
  | 'product_added'
  | 'product_updated'
  | 'document_added'
  | 'receipt_added'
  | 'service_added'
  | 'reminder_scheduled';

export interface Activity {
  id: string;
  kind: ActivityKind;
  productId: string | null;
  subject: string;
  createdAt: string;
}
