import React, { forwardRef, useMemo, useRef, useImperativeHandle, useCallback } from 'react';
import { Platform } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS } from '@/constants/colors';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: -1 | 0 | 1 | 2; // -1 to start closed
  enablePanDownToClose?: boolean;
  onChange?: (index: number) => void; // index can be -1 when closed
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
    const sheetRef = useRef<BottomSheet>(null);
    const snaps = useMemo(() => snapPoints ?? DEFAULT_SNAPS, [snapPoints]);

    const expand = useCallback(() => sheetRef.current?.expand(), []);
    const collapse = useCallback(() => sheetRef.current?.collapse(), []);
    const snapToIndex = useCallback((i: number) => sheetRef.current?.snapToIndex(i), []);
    const close = useCallback(() => sheetRef.current?.close(), []);

    useImperativeHandle(ref, () => ({ expand, collapse, snapToIndex, close }), [
      expand,
      collapse,
      snapToIndex,
      close,
    ]);

    return (
      <BottomSheet
        ref={sheetRef}
        index={initialIndex}
        snapPoints={snaps}
        enablePanDownToClose={enablePanDownToClose}
        handleIndicatorStyle={{ backgroundColor: COLORS.label.onDark.tertiary }}
        backgroundStyle={{
          backgroundColor: COLORS.pageBackground,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          ...(Platform.OS === 'android' ? { elevation: 8 } : null),
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
