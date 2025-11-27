import CameraScreen from '@/features/camera/camera-screen';
import { StyleSheet, View } from 'react-native';
import React, { useRef, useEffect } from 'react';
import Sheet from '@/components/views/bottom-sheet/bottom-sheet';
import { InspectionDetails } from '@/features/inspection-details/inspection-details';
import { useLocalSearchParams } from 'expo-router';
import { useInspectionsStore } from '@/features/home/state';
import { useActiveInspectionStore } from '@/features/inspection-details/state';

export default function HomeScreen() {
  const sheetRef = useRef<any>(null);
  const { id } = useLocalSearchParams<{ id: string }>();

  // set active inspection based on route id when this screen mounts
  useEffect(() => {
    if (!id) return;
    const inspections = useInspectionsStore.getState().inspections;
    if (!inspections) return;
    const found = inspections.find(i => String(i.id) === String(id));
    if (found) {
      // convert to ActiveInspection shape (includes observations array)
      useActiveInspectionStore.getState().setActiveInspection({
        id: found.id,
        client: found.client,
        address: found.address,
        createdAt: found.createdAt,
        observations: [],
      });
    }

    return () => {
      useActiveInspectionStore.getState().clearActiveInspection();
    };
  }, [id]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraScreen />

      <Sheet ref={sheetRef} initialIndex={0} enablePanDownToClose={false} scrollable={false}>
        {/* single child: inspection details container (presentation and handlers inside) */}
        <InspectionDetails />
      </Sheet>
    </View>
  );
}
