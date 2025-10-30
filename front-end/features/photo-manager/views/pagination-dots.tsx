// components/PaginationDots.tsx
import { COLORS } from '@/constants/colors';
import { View, StyleSheet } from 'react-native';

type Props = {
  count: number;
  activeIndex: number;
};

export default function PaginationDots({ count, activeIndex }: Props) {
  if (count <= 1) return null;
  const inactiveColor = COLORS.label.onDark.tertiary;
  const activeColor = COLORS.label.onDark.primary;
  const size = 8;

  return (
    <View style={[styles.row, { gap: 6 }]}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === activeIndex;
        const style = {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isActive ? activeColor : inactiveColor,
          opacity: isActive ? 1 : 0.9,
          transform: [{ scale: isActive ? 1 : 0.9 }],
        } as const;

        return <View key={i} style={style} accessibilityLabel={`Page ${i + 1}`} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
