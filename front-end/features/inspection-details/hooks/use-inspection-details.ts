import { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useActiveInspectionStore } from '../state';
import type { Observation } from '../../edit-observation/state';
import { useShallow } from 'zustand/react/shallow';
import type { InspectionDetailsViewProps } from '../views/inspection-details-view';
import { fetchActiveInspectionDetails } from './backend-calls';

export function useInspectionDetails(): InspectionDetailsViewProps {
  const [activeInspection, setActiveInspection] = useActiveInspectionStore(
    useShallow(state => [state.activeInspection, state.setActiveInspection])
  );

  const onSelectObservation = (observationId: string) => {
    if (!activeInspection?.id) return;
    router.push(
      `/active-inspection/${activeInspection.id}/observation-details?observationId=${encodeURIComponent(
        observationId
      )}`
    );
  };

  const sections = useMemo(() => {
    if (!activeInspection?.observations?.length) return [];

    const grouped = new Map<string, Observation[]>();

    for (const observation of activeInspection.observations) {
      const key = observation.section || 'Uncategorized';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(observation);
    }

    return Array.from(grouped.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [activeInspection?.observations]);

  const onCreateReport = () => {
    if (!activeInspection) return;
    const url = `https://inspection-report-topaz.vercel.app/view/${activeInspection.id}`;
    Linking.openURL(url);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const onSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  const { id: activeInspectionId } = useLocalSearchParams<{ id: string }>(); // TODO set active inspection state here

  useEffect(() => {
    if (!activeInspectionId) return;

    let isMounted = true;

    async function load() {
      try {
        const fullInspection = await fetchActiveInspectionDetails(activeInspectionId || '');
        console.log(fullInspection);
        if (!isMounted) return;
        setActiveInspection(fullInspection);
      } catch (err) {
        console.error('Failed to fetch inspection details:', err);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [setActiveInspection]);

  return {
    inspection: activeInspection,
    onCreateReport,
    onSearchChange,
    onSelectObservation,
    searchTerm,
    sections,
  };
}
