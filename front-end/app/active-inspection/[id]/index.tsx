import CameraScreen from '@/features/camera/camera-screen';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Linking } from 'react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import Sheet from '@/components/views/bottom-sheet/bottom-sheet';
import { InspectionDetails } from '@/features/inspection-details/inspection-details';
import { useInspectionsStore } from '@/features/home/state';
import { useActiveInspectionStore } from '@/features/inspection-details/state';
import { COLORS } from '@/constants/colors';

export default function HomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const inspection = useInspectionsStore(store => store.inspections.find(i => i.id === id));

  const setActiveInspection = useActiveInspectionStore(s => s.setActiveInspection);

  const sheetRef = useRef<any>(null);

  const onCreateReport = () => {
    if (!inspection) return;
    const url = `https://inspection-report-topaz.vercel.app/view/${inspection.id}`;
    Linking.openURL(url).catch(() => {
      /* noop for now */
    });
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraScreen />

      <Sheet ref={sheetRef} initialIndex={0} enablePanDownToClose={false}>
        {/* single child: inspection details container (presentation and handlers inside) */}
        <InspectionDetails />
      </Sheet>
    </View>
  );
}
