import { COLORS } from '@/constants/colors';
import CameraScreen from '@/features/camera/camera-screen';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CameraScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pageBackground,
  },
});
