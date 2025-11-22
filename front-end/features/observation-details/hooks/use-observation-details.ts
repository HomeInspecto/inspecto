import { useState, useRef, useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Dimensions } from 'react-native';
import type { ObservationDetailsViewProps } from '../views/observation-details-view';
import { useActiveInspectionStore } from '@/features/inspection-details/state';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import type { Observation } from '@/features/edit-observation/state';

const screenWidth = Dimensions.get('window').width;

export function useObservationDetails(): ObservationDetailsViewProps {
  const { id, observationId } = useLocalSearchParams<{ id?: string; observationId?: string }>();
  const { activeInspection } = useActiveInspectionStore(
    useShallow(state => ({
      activeInspection: state.activeInspection,
    }))
  );

  const { sectionMap } = useActiveInspectionStore(
    useShallow(state => ({ sectionMap: state.sectionMap }))
  );

  const decodedObservationId = observationId ? decodeURIComponent(observationId) : '';

  const observation = useMemo(() => {
    if (!activeInspection?.observations?.length || !decodedObservationId) return undefined;
    const found = activeInspection.observations.find(obs => obs.name === decodedObservationId);
    if (!found) return undefined;
    
    const sectionName = sectionMap.get(found.section || '') || found.section || 'Uncategorized';
    
    return {
      ...found,
      section: sectionName,
    } as Observation;
  }, [activeInspection?.observations, decodedObservationId, sectionMap]);

  const setObservation = useActiveObservationStore(s => s.setObservation);

  const onEdit = () => {
    if (!observation || !id) return;
    setObservation(observation);
    router.push(`/active-inspection/${id}/log-observation`);
  };

  const photos = observation?.photos || [];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const scrollViewRef = useRef<any>(null);

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    if (index !== activePhotoIndex && index >= 0 && index < photos.length) {
      setActivePhotoIndex(index);
    }
  };

  return {
    observationId: decodedObservationId,
    observation,
    onGoBack: () => router.back(),
    onEdit,
    scrollViewRef,
    onScroll,
    activePhotoIndex,
    screenWidth: screenWidth,
  };
}

