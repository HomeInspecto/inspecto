import { useInspectionsStore } from '../state';
import { router } from 'expo-router';
import type { InspectionsListViewProps } from './inspections-list-view';

export function useInspectionsList(): InspectionsListViewProps {
  const inspections = useInspectionsStore(state => state.inspections);

  const onSelectInspection = (id: string) => {
    router.push(`/active-inspection/${id}`);
  };

  return {
    inspections,
    onSelectInspection,
  };
}
