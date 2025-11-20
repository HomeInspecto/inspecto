import { useInspectionsStore } from '../state';
import { router } from 'expo-router';
import type { InspectionsListViewProps } from './inspections-list-view';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useShallow } from 'zustand/shallow';
import { useEffect } from 'react';
import { fetchInspectionsWithAddresses } from './backend-calls';
import { useActiveInspectionStore } from '@/features/inspection-details/state';

export function useInspectionsList(): InspectionsListViewProps {
  const inspections = useInspectionsStore(state => state.inspections);
  const setInspections = useInspectionsStore(useShallow(s => s.setInspections));

  const setActiveInspection = useActiveInspectionStore(useShallow(s => s.setActiveInspection));

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
    const inspection = inspections?.find(i => i.id === id);
    if (inspection) setActiveInspection(structuredClone(inspection));
    router.push(`/active-inspection/${id}`);
  };

  return {
    inspections,
    onSelectInspection,
  };
}
