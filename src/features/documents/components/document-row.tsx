import { FileText, Image as ImageIcon, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { PressableCard, Text } from '@/shared/components/ui';
import type { ColorToken } from '@/shared/theme/colors';
import { useTheme } from '@/shared/theme/theme-provider';

import { isImageDocument } from '../services/document-rules';
import type { Document } from '../types';

export function documentVisual(document: Pick<Document, 'mimeType' | 'type'>): { icon: LucideIcon; bg: ColorToken; fg: ColorToken } {
  if (document.type === 'contract' || document.type === 'other') {
    return { icon: FileText, bg: 'neutral-bg', fg: 'neutral-text' };
  }
  if (isImageDocument(document.mimeType)) {
    return { icon: ImageIcon, bg: 'primary-tint', fg: 'primary' };
  }
  return { icon: FileText, bg: 'danger-bg', fg: 'danger-icon' };
}

export interface DocumentRowProps {
  document: Document;
  subtitle: string;
  trailing?: ReactNode;
  onPress: () => void;
  compact?: boolean;
}

export function DocumentRow({ document, subtitle, trailing, onPress, compact = false }: DocumentRowProps) {
  const { colors } = useTheme();
  const visual = documentVisual(document);
  const Icon = visual.icon;
  const size = compact ? 38 : 40;
  return (
    <PressableCard onPress={onPress} accessibilityLabel={`${document.name}, ${subtitle}`} className={compact ? 'flex-row items-center gap-3 px-3.5 py-3' : 'flex-row items-center gap-3 p-3.5'}>
      <View className="items-center justify-center rounded-[10px]" style={{ width: size, height: size, backgroundColor: colors[visual.bg] }}>
        <Icon size={18} color={colors[visual.fg]} strokeWidth={2} />
      </View>
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="font-semibold text-[13.5px]">
          {document.name}
        </Text>
        <Text numberOfLines={1} className="font-body text-[11.5px] text-text-secondary">
          {subtitle}
        </Text>
      </View>
      {trailing}
    </PressableCard>
  );
}
