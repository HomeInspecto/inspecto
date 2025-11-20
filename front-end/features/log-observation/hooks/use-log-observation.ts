  import { useCallback, useEffect, useState } from 'react';
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
  import { authService } from '@/services/auth';


  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'localhost:4000';

  export function useLogObersation(): LogObservationProps {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [sectionOptions, setSectionOptions] = useState<
      { name: string; value: string }[]
    >([]);  


    type SectionFromApi = {
      id: string;
      section_name: string;
      notes: string | null;
      priority_rating: number;
    };

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

    const addObservation = useActiveInspectionStore(
      useShallow(state => state.addObservation)
    );

    
    // 🔹 Fetch sections once when the hook is used
    useEffect(() => {
      const fetchSections = async () => {
        try {
          // Get auth token from auth service
          const token = await authService.getAccessToken();

          const res = await fetch(`${API_BASE_URL}/api/sections/all`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          const data = (await res.json()) as { sections: SectionFromApi[] };

          const options = data.sections.map(section => ({
            name: section.section_name, // what user sees
            value: section.id,          // what we send to backend
          }));

          setSectionOptions(options);
          // User must manually select a section (no auto-selection)
        } catch (error) {
          console.error('Error fetching sections', error);
        }
      };

      fetchSections();
    }, []);

    const onLog = useCallback(async () => {
      const obsrState = useActiveObservationStore.getState();

      // Check if severity is selected
      if (!obsrState.severity) {
        Alert.alert(
          'Required Field',
          'Please select a severity level before logging the observation.'
        );
        return;
      }

      // Check if section is selected
      if (!obsrState.section) {
        Alert.alert(
          'Required Field',
          'Please select a section before logging the observation.'
        );
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
        const formData = new FormData();

        formData.append('section_id', obsrState.section);
        formData.append('obs_name', obsrState.name ?? '');
        formData.append('description', obsrState.description ?? '');
        formData.append('severity', obsrState.severity ?? '');
        formData.append('status', 'open');
        formData.append('recommendation', obsrState.recommendation ?? '');
        formData.append('implication', obsrState.implications ?? '');

        //add photos
        if (obsrState.photos && obsrState.photos.length > 0) {
          obsrState.photos.forEach((photo, index) => {
            formData.append('files', {
              uri: photo.uri,
              name: `photo_${index}.jpg`,
              type: 'image/jpeg',
            } as any);
          });
        }

        const res = await fetch(`${API_BASE_URL}/api/observations/createObservation`, {
          method: 'POST',
          body: formData, // ❗ NO Content-Type header
        });

        if (!res.ok) {
          Alert.alert('Error', 'Failed to log observation.');
          return;
        }

        addObservation(structuredClone(observation));
        router.push(`/active-inspection/${id}`);
        clearObservation();

      } catch (error) {
        console.error('Error calling createObservation', error);
      }


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
      sectionOptions
    };
  }
