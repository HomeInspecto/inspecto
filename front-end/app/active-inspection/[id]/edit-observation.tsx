import { COLORS } from '@/constants/colors';
import PhotoMarkup from '@/features/photo-manager/photo-manager';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PhotoMarkup></PhotoMarkup>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pageBackground,
  },
});
