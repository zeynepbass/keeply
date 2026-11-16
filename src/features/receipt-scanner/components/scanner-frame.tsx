import { View } from 'react-native';

const CORNER = 28;
const STROKE = 3;

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const vertical = position.startsWith('t') ? { top: 0 } : { bottom: 0 };
  const horizontal = position.endsWith('l') ? { left: 0 } : { right: 0 };
  return (
    <View
      style={{
        position: 'absolute',
        width: CORNER,
        height: CORNER,
        ...vertical,
        ...horizontal,
        borderColor: '#FFFFFF',
        borderTopWidth: position.startsWith('t') ? STROKE : 0,
        borderBottomWidth: position.startsWith('b') ? STROKE : 0,
        borderLeftWidth: position.endsWith('l') ? STROKE : 0,
        borderRightWidth: position.endsWith('r') ? STROKE : 0,
        borderTopLeftRadius: position === 'tl' ? 14 : 0,
        borderTopRightRadius: position === 'tr' ? 14 : 0,
        borderBottomLeftRadius: position === 'bl' ? 14 : 0,
        borderBottomRightRadius: position === 'br' ? 14 : 0,
      }}
    />
  );
}

export function ScannerFrame() {
  return (
    <View pointerEvents="none" className="aspect-[3/4] w-[78%] self-center" importantForAccessibility="no-hide-descendants">
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />
    </View>
  );
}
