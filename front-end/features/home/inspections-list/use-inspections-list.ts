import { useInspectionsStore } from '../state';
import { router } from 'expo-router';
import type { InspectionsListViewProps } from './inspections-list-view';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useShallow } from 'zustand/shallow';
import { useEffect } from 'react';
import { fetchInspectionsWithAddresses } from './backend-calls';

export function useInspectionsList(): InspectionsListViewProps {
  const inspections = useInspectionsStore(state => state.inspections);
  const setInspections = useInspectionsStore(useShallow(s => s.setInspections));

  const clearObservation = useActiveObservationStore(useShallow(s => s.clearObservation));

  // runs one time on mount
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const mappedInspections = await fetchInspectionsWithAddresses();

        if (isMounted) {
          setInspections(mappedInspections);
        }
      } catch (err) {
        console.error('Failed to fetch inspections:', err);
        if (isMounted) {
          setInspections([]);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [setInspections]);

  const onSelectInspection = (id: string) => {
    clearObservation();
    router.push(`/active-inspection/${id}`);
  };

  return {
    inspections,
    onSelectInspection,
  };
}
