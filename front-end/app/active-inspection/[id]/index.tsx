import CameraScreen from '@/features/camera/camera-screen';
import { useLocalSearchParams } from 'expo-router';

export default function HomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // TODO set active inspection state here

  return <CameraScreen />;
}
