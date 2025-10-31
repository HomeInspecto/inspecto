import Button from '@/components/views/button/button';
import IconButton from '@/components/views/icon-button/icon-button';
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
  goBack: () => void;
}

export function CreateInspectionView({
  client,
  address,
  onClientChange,
  onAddressChange,
  onCreate,
  goBack,
}: CreateInspectionViewProps) {
  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        padding: 16,
        backgroundColor: COLORS.pageBackground,
        paddingTop: 80,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <IconButton onPress={goBack} size="sm" color="secondary" icon="chevron.left" />
        </View>
        <Text variant="title2" weight="emphasized" style={{ textAlign: 'center' }}>
          New inspection
        </Text>
        <View style={{ flex: 1 }}></View>
      </View>

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

      <Button text="Create inspection" onPress={onCreate} icon="plus"></Button>
    </View>
  );
}
