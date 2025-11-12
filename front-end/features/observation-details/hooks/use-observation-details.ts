import { useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import type { ObservationDetailsViewProps } from '../views/observation-details-view';
import { useActiveInspectionStore } from '@/features/inspection-details/state';

export function useObservationDetails(): ObservationDetailsViewProps {
  const { id, observationId } = useLocalSearchParams<{ id?: string; observationId?: string }>();
  const { activeInspection } = useActiveInspectionStore(
    useShallow(state => ({
      activeInspection: state.activeInspection,
    }))
  );

  const decodedObservationId = observationId ? decodeURIComponent(observationId) : '';

  const observation = useMemo(() => {
    if (!activeInspection?.observations?.length || !decodedObservationId) return undefined;
    return activeInspection.observations.find(obs => obs.name === decodedObservationId);
  }, [activeInspection?.observations, decodedObservationId]);

  return {
    inspectionId: id ?? '',
    observationId: decodedObservationId,
    observation,
    onGoBack: () => router.back(),
  };
}

