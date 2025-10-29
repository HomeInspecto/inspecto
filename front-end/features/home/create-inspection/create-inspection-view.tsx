import Button from '@/components/views/button/button';
import TextInput from '@/components/views/text-input/text-input';
import Text from '@/components/views/text/text';
import { COLORS } from '@/constants/colors';
import { View } from 'react-native';

export interface CreateInspectionViewProps {
  client: string;
  address: string;

  onClientChange: (value: string) => void;
  onAddressChange: (value: string) => void;

  onCreate: () => void;
}

export function CreateInspectionView({
  client,
  address,
  onClientChange,
  onAddressChange,
  onCreate,
}: CreateInspectionViewProps) {
  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        padding: 16,
        backgroundColor: COLORS.pageBackground,
      }}
    >
      <Text variant="title3" style={{ textAlign: 'center' }}>
        Create Inspection
      </Text>

      <View style={{ gap: 12 }}>
        <Text variant="headline">Client</Text>
        <TextInput value={client} onChangeText={onClientChange} placeholder="Client name" />
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="headline">Address</Text>
        <TextInput
          value={address}
          onChangeText={onAddressChange}
          placeholder="Enter address"
          multiline
        />
      </View>

      <Button text="Create inspection" onPress={onCreate} icon="TODO-get-plus-icon"></Button>
    </View>
  );
}
