import Text from '@/components/views/text/text';
import { COLORS } from '@/constants/colors';
import { AddObservationNote } from '@/features/add-observation-note/add-observation-note';
import PhotoEditor from '@/features/photo-editor/photo-editor';
import { View } from 'react-native';

export default function EditObservation() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: COLORS.pageBackground,
      }}
    >
      <View style={{ aspectRatio: '3 / 4' }}>
        <PhotoEditor />
      </View>

      <View
        style={{
          height: 228,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          backgroundColor: '#2e2e2f',
        }}
      >
        <Text>placeholder for swipe photos </Text>
        <AddObservationNote />
      </View>
    </View>
  );
}
