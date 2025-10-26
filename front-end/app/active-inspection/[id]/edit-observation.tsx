import Text from '@/components/views/text';
import { COLORS } from '@/constants/colors';
import { AddObservationNote } from '@/features/add-observation-note/add-observation-note';
import PhotoMarkup from '@/features/photo-manager/photo-manager';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={{ aspectRatio: '3 / 4', backgroundColor: 'red' }}>
        <PhotoMarkup />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.pageBackground,
  },
});
