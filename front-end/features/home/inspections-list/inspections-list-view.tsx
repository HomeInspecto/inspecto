import { View, FlatList } from 'react-native';
import Text from '@/components/views/text/text';
import Button from '@/components/views/button/button';
import type { Inspection } from '../state';

export interface InspectionsListViewProps {
  inspections: Inspection[];
  onSelect: (id: string) => void;
}

export function InspectionsListView({ inspections, onSelect }: InspectionsListViewProps) {
  return (
    <View style={{ flex: 1, gap: 16 }}>
      <View>
        <Text variant="title3" style={{ textAlign: 'center' }}>
          Inspections
        </Text>
      </View>

      <FlatList
        data={inspections}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={{ gap: 8, paddingVertical: 8 }}>
            <Text variant="headline">{item.client}</Text>
            <Text variant="body" style={{ color: '#666' }}>
              {item.address}
            </Text>
            <View style={{ marginTop: 8 }}>
              <Button text="Open" onPress={() => onSelect(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}
