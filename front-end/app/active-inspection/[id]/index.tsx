import CameraScreen from '@/features/camera/camera-screen';
import { StyleSheet, View } from 'react-native';
import React, { useRef } from 'react';
import Sheet from '@/components/views/bottom-sheet/bottom-sheet';
import { InspectionDetails } from '@/features/inspection-details/inspection-details';

export default function HomeScreen() {
  const sheetRef = useRef<any>(null);

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
