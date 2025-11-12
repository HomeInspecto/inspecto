import { useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useActiveInspectionStore, type ActiveInspection } from './state';
import type { Observation } from '../edit-observation/state';
import { useShallow } from 'zustand/react/shallow';
import type { InspectionDetailsViewProps } from './inspection-details-view';

export function useInspectionDetails(): InspectionDetailsViewProps {
  const { activeInspection } = useActiveInspectionStore(
    useShallow(state => ({
      activeInspection: state.activeInspection,
    }))
  );

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
    searchTerm,
    sections,
  };
}
