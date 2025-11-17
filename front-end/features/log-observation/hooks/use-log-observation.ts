import { useCallback } from 'react';
import type { LogObservationProps } from '../views/log-observation-view';
import { router, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Alert } from 'react-native';
import {
  useActiveObservationStore,
  type Observation,
  type Severity,
} from '@/features/edit-observation/state';
import { useActiveInspectionStore } from '@/features/inspection-details/state';

export function useLogObersation(): LogObservationProps {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [
    setObservation,
    clearObservation,
    name,
    description,
    implications,
    recommendation,
    section,
    severity,
  ] = useActiveObservationStore(
    useShallow(s => [
      s.setObservation,
      s.clearObservation,
      s.name ?? '',
      s.description ?? '',
      s.implications ?? '',
      s.recommendation ?? '',
      s.section ?? '',
      s.severity ?? null,
    ])
  );

  const setName = (v: string) => setObservation({ name: v });
  const setDescription = (v: string) => setObservation({ description: v });
  const setImplication = (v: string) => setObservation({ implications: v });
  const setRecommendation = (v: string) => setObservation({ recommendation: v });
  const setSection = (v: string) => setObservation({ section: v });
  const setSeverity = (v: Severity) => setObservation({ severity: v });

  const addObservation = useActiveInspectionStore(useShallow(state => state.addObservation));

  const onLog = useCallback(async () => {
    const obsrState = useActiveObservationStore.getState();

      // Check if severity is selected
      if (!obsrState.severity) {
        Alert.alert('Required Field', 'Please select a severity level before logging the observation.');
        return;
      }

    const observation: Observation = {
      name: obsrState.name,
      description: obsrState.description,
      implications: obsrState.implications,
      recommendation: obsrState.recommendation,
      section: obsrState.section,
      severity: obsrState.severity,
      photos: obsrState.photos,
      fieldNote: obsrState.fieldNote,
    };


    try {
      await fetch(
        'https://my-branch-production.up.railway.app/api/observations/createObservation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section_id: obsrState.section,          // for now, using whatever is in `section`
            obs_name: obsrState.name,
            description: obsrState.description,
            severity: 'minor',
            status: 'open',
            recommendation: obsrState.recommendation,
            implication: obsrState.implications,
            files: [],                              // images can be wired later
          }),
        }
      );
    } catch (error) {
      console.error('Error calling createObservation', error);
    }


    addObservation(structuredClone(observation));

    router.push(`/active-inspection/${id}`);
    clearObservation();
  }, [
    name,
    description,
    implications,
    recommendation,
    section,
    severity,
    addObservation,
    id,
    clearObservation,
  ]);

  return {
    onLog,
    name,
    description,
    implication: implications,
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
