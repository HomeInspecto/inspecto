import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Text from '@/components/views/text/text';
import { COLORS } from '@/constants/colors';
import type { ActiveInspection } from './state';
import Button from '@/components/views/button/button';

export interface InspectionDetailsViewProps {
  inspection?: ActiveInspection;
  onCreateReport: () => void;
  onAddObservation: (/* implement later */) => void;
}

export function InspectionDetailsView({ inspection, onCreateReport }: InspectionDetailsViewProps) {
  return (
    <View style={{ flex: 1, gap: 16 }}>
      <Text variant="title3" weight="emphasized">
        Inspection details
      </Text>

      <View
        style={{ backgroundColor: COLORS.material.secondary.fill, padding: 16, borderRadius: 20 }}
      >
        <Text variant="headline" color="on-dark-primary">
          {inspection ? inspection.client : 'Client name'}
        </Text>
        <Text variant="body" color="on-dark-secondary">
          {inspection ? inspection.address : 'Address'}
        </Text>
        <Text variant="body" color="on-dark-secondary" style={{ marginTop: 8 }}>
          {inspection ? new Date(inspection.createdAt).toLocaleDateString() : 'Date'}
        </Text>
      </View>

      <Button text="Create report" icon="doc.text.fill" onPress={onCreateReport} />

      <Text variant="title3" weight="emphasized">
        Inspection details
      </Text>

      <View>
        <Text variant="body" color="on-dark-secondary">
          observations list (placeholder)
        </Text>
      </View>
    </View>
  );
}
