import EditObservation from '@/features/edit-observation/edit-observation';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // set active inspection state

  return <EditObservation />;
}
