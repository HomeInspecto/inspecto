import EditObservation from '@/features/edit-observation/edit-observation';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // TODO set active inspection state here
  const { photos } = useActiveObservationStore(useShallow(s => ({ photos: s.photos })));

  const navigatedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (navigatedRef.current) return;
      if (!photos || photos.length === 0) {
        navigatedRef.current = true;
        router.replace(`/active-inspection/${id}`); // go to camera
      }
    }, [photos, id])
  );

  if (!photos || photos.length === 0) return null;

  return <EditObservation />;
}
