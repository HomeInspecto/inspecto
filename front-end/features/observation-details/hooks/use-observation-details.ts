import { useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import type { ObservationDetailsViewProps } from '../views/observation-details-view';
import { useActiveInspectionStore } from '@/features/inspection-details/state';
import { useActiveObservationStore } from '@/features/edit-observation/state';

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

  const setObservation = useActiveObservationStore(s => s.setObservation);

  const onEdit = () => {
    if (!observation || !id) return;
    setObservation(observation);
    router.push(`/active-inspection/${id}/log-observation`);
  };

  return {
    observationId: decodedObservationId,
    observation,
    onGoBack: () => router.back(),
    onEdit,
  };
}

