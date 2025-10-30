import { useCallback, useState } from 'react';
import type { LogObservationProps } from '../views/log-observation-view';
import { router, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useActiveInspectionStore } from '@/features/inspection-details/state';

type Section = 'Roof and Gutter' | 'Backyard' | 'Hot Water System';
type Severity = 'Critical' | 'Medium' | 'Low';

export function useLogObersation(): LogObservationProps {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [implication, setImplication] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('');

  const [section, setSection] = useState<Section>('Backyard');
  const [severity, setSeverity] = useState<Severity>('Low');

  const clearObservation = useActiveObservationStore(useShallow(s => s.clearObservation));
  
  const activeObservation = useActiveObservationStore(useShallow(s => ({
    photos: s.photos,
    fieldNote: s.fieldNote
  })))
  const addObservation = useActiveInspectionStore(useShallow(state => (state.addObservation)));
  
  const onLog = useCallback(() => {
    // TODO: replace with your actual submit/dispatch
    // e.g., send to backend / add to store
    console.log('Logging observation', {
      name,
      description,
      implication,
      recommendation,
      section,
      severity,
    });

    addObservation(structuredClone(activeObservation))

    router.push(`/active-inspection/${id}`);
    clearObservation();
  }, [name, description, implication, recommendation, section, severity]);

  return {
    onLog,
    name,
    description,
    implication,
    recommendation,
    section,
    severity,
    setName,
    setDescription,
    setImplication,
    setRecommendation,
    setSection,
    setSeverity,
  };
}
