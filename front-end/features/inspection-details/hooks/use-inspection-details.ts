import { useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { useActiveInspectionStore, type ActiveInspection } from '../state';
import type { Observation } from '../../edit-observation/state';
import { useShallow } from 'zustand/react/shallow';
import type { InspectionDetailsViewProps } from '../views/inspection-details-view';

export function useInspectionDetails(): InspectionDetailsViewProps {
  const { activeInspection } = useActiveInspectionStore(
    useShallow(state => ({
      activeInspection: state.activeInspection,
    }))
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

  return {
    inspection: activeInspection,
    onCreateReport,
    onSearchChange,
    onSelectObservation,
    searchTerm,
    sections,
  };
}
