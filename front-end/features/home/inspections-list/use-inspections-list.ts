import { useInspectionsStore } from '../state';
import { router } from 'expo-router';
import type { InspectionsListViewProps } from './inspections-list-view';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useShallow } from 'zustand/shallow';

export function useInspectionsList(): InspectionsListViewProps {
  const inspections = useInspectionsStore(state => state.inspections);
  const clearObservation = useActiveObservationStore(useShallow(s => s.clearObservation));

  const onSelectInspection = (id: string) => {
    clearObservation();

    router.push(`/active-inspection/${id}`);
  };

  return {
    inspections,
    onSelectInspection,
  };
}
