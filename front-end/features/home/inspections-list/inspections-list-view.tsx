import { View, FlatList, Pressable } from 'react-native';
import Text from '@/components/views/text/text';
import type { Inspection } from '../state';
import { COLORS } from '@/constants/colors';

export interface InspectionsListViewProps {
  inspections: Inspection[];
  onSelectInspection: (id: string) => void;
}

export function InspectionsListView({
  inspections,
  onSelectInspection: onSelect,
}: InspectionsListViewProps) {
  return (
    <View style={{ flex: 1, gap: 16 }}>
      <View>
        <Text variant="headline">This week</Text>
      </View>

      <FlatList
        data={inspections}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelect(item.id)}>
            <View
              style={{
                gap: 4,
                padding: 16,
                borderRadius: 20,
                backgroundColor: COLORS.material.secondary.fill,
              }}
            >
              <Text variant="headline" color="on-dark-primary">
                {item.address}
              </Text>
              <Text variant="body" color="on-dark-secondary">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
