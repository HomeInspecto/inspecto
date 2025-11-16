import React from 'react';
import { View, SectionList, Pressable } from 'react-native';
import Text from '@/components/views/text/text';
import { COLORS } from '@/constants/colors';
import type { ActiveInspection } from '../state';
import type { Observation } from '../../edit-observation/state';
import Button from '@/components/views/button/button';
import TextInput from '@/components/views/text-input/text-input';
import { Icon } from '@/components/views/icon/icon';

export interface InspectionDetailsViewProps {
  inspection?: ActiveInspection;
  onCreateReport: () => void;
  searchTerm: string;
  onSearchChange: (text: string) => void;
  onSelectObservation: (observationId: string) => void;
  sections: Array<{
    title: string;
    data: Observation[];
  }>;
}

export function InspectionDetailsView({
  inspection,
  onCreateReport,
  searchTerm,
  onSearchChange,
  onSelectObservation,
  sections,
}: InspectionDetailsViewProps) {
  if (!inspection) return;

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <View style={{ backgroundColor: COLORS.pageBackground, padding: 4, borderRadius: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'  }}>
          <Text variant="headline" color="on-dark-primary" >{inspection ? inspection.address : 'Address'}</Text>
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

      <Text variant="title3" weight="emphasized">Observations</Text>

      <TextInput
        value={searchTerm}
        placeholder="Search"
        leftIcon="search"
        rightIcon="mic"
        onChangeText={onSearchChange}
      />

      <SectionList
        style={{ flex: 1 }}
        sections={sections}
        keyExtractor={(item, index) => `${item.name ?? 'observation'}-${index}`}
        renderSectionHeader={({ section: { title } }) => (
          <Text variant="body" weight="emphasized" color="on-dark-secondary">{title}</Text>
        )}
        renderItem={({ item, index }) => {
          const label = item.name || `Observation ${index + 1}`;
          return (
            <View style={{ paddingLeft: 12 }}>
              <Pressable onPress={() => onSelectObservation(item.name ?? label)}>
                <View
                  style={{
                    backgroundColor: COLORS.material.secondary.fill,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text variant="body" color="on-dark-primary">{label}</Text>
                </View>
              </Pressable>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          <View><Text>No observations logged.</Text></View>
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
      />
    </View>
  );
}
