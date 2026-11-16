import { CircleCheck, Clock, TriangleAlert } from 'lucide-react-native';

import type { Product } from '@/features/products/types';
import { Badge } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { today } from '@/shared/utils/date';

import { getWarranty } from '../services/warranty-calculator';

export function WarrantyBadge({ product, referenceDate = today() }: { product: Product; referenceDate?: string }) {
  const warranty = getWarranty(product, referenceDate);
  if (!warranty) {
    return <Badge label={t.warrantyStatus.none} tone="neutral" />;
  }
  if (warranty.status === 'expired') {
    return <Badge label={t.warrantyStatus.expired} tone="danger" icon={TriangleAlert} />;
  }
  if (warranty.status === 'expiring') {
    return <Badge label={t.common.days(warranty.remainingDays)} tone="warning" icon={Clock} />;
  }
  return <Badge label={t.warrantyStatus.active} tone="success" icon={CircleCheck} />;
}
