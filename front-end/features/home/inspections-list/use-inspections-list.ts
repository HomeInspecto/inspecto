import { dummyInspection, useInspectionsStore, type Inspection } from '../state';
import { router } from 'expo-router';
import type { InspectionsListViewProps } from './inspections-list-view';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useShallow } from 'zustand/shallow';
import { useEffect } from 'react';

export function useInspectionsList(): InspectionsListViewProps {
  const inspections = useInspectionsStore(state => state.inspections);
  const setInspections = useInspectionsStore(useShallow(s => s.setInspections));

  const clearObservation = useActiveObservationStore(useShallow(s => s.clearObservation));

  // runs one time on mount
  useEffect(() => {
    async function fetchInspections() {
      const API_BASE = 'https://inspecto-production.up.railway.app';

      // const res = await fetch(API_BASE + '/api/inspections/all');
      // const data = await res.json();
      const data = { inspections: [dummyInspection] };

      const inspections: Inspection[] = data.inspections.map((inspection: any) => ({
        id: inspection.id,
        client: '',
        address: '',
        createdAt: inspection.created_at,
      }));

      setInspections(inspections);
    }

    fetchInspections();
  }, []);

  const onSelectInspection = (id: string) => {
    clearObservation();

    router.push(`/active-inspection/${id}`);
  };

  return {
    inspections,
    onSelectInspection,
  };
}
