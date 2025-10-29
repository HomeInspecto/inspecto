import React, { forwardRef, useMemo, useRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { COLORS } from '@/constants/colors';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  enablePanDownToClose?: boolean;
  onChange?: (index: number) => void;
}

export type BottomSheetRef = {
  expand: () => void;
  collapse: () => void;
  snapToIndex: (index: number) => void;
  close: () => void;
};

const DEFAULT_SNAPS = ['25%', '50%', '90%'];

const Sheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, snapPoints, initialIndex = 1, enablePanDownToClose = true, onChange }, ref) => {
    const sheetRef = useRef<BottomSheetMethods | null>(null);
    const snaps = useMemo(() => snapPoints ?? DEFAULT_SNAPS, [snapPoints]);

    useImperativeHandle(ref, () => ({
      expand: () => sheetRef.current?.expand(),
      collapse: () => sheetRef.current?.collapse(),
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      close: () => sheetRef.current?.close(),
    }));

    return (
      <BottomSheet
        ref={sheetRef}
        index={initialIndex}
        snapPoints={snaps}
        enablePanDownToClose={enablePanDownToClose}
        handleIndicatorStyle={{ backgroundColor: COLORS.label.onDark.tertiary }}
        backgroundStyle={{
          backgroundColor: COLORS.pageBackground,
          boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.3)',
        }}
        onChange={onChange}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default Sheet;
