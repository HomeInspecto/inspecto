import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Text from '@/components/views/text/text';
import { COLORS } from '@/constants/colors';
import type { ActiveInspection } from './state';
import Button from '@/components/views/button/button';
import TextInput from '@/components/views/text-input/text-input';
import { Icon } from '@/components/views/icon/icon';

export interface InspectionDetailsViewProps {
  inspection?: ActiveInspection;
  onCreateReport: () => void;
  searchTerm: string;
  onSearchChange: (text: string) => void;
}

export function InspectionDetailsView({
  inspection,
  onCreateReport,
  searchTerm,
  onSearchChange,
}: InspectionDetailsViewProps) {
  if (!inspection) return;

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <View style={{ backgroundColor: COLORS.pageBackground, padding: 4, borderRadius: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'  }}>
          <Text variant="headline" color="on-dark-primary" >
            {inspection ? inspection.address : 'Address'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="person.fill" size={14} color={COLORS.label.onDark.secondary} />
            <Text variant="footnote" color="on-dark-tertiary" style={{ textAlign: 'right'}}>    
              {inspection ? inspection.client : 'Client name' }
            </Text>
          </View>
        </View>
      </View>

      <Button text="View report" icon="doc.text.fill" onPress={onCreateReport} />
      <View style={{ height: 1, backgroundColor: COLORS.material.secondary.stroke }} />

      <Text variant="title3" weight="emphasized">
        Observations
      </Text>

      <TextInput
        value={searchTerm}
        placeholder="Search"
        leftIcon="search"
        rightIcon="mic"
        onChangeText={onSearchChange}
      />

      <View>
        {!inspection.observations?.length && <Text>No observations logged.</Text>}
        {inspection.observations.map((observation, idx) =>
          observation.fieldNote ? <Text key={`obs-${idx}`}>{observation.fieldNote}</Text> : null
        )}
      </View>
    </View>
  );
}
