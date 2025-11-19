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
    const i_id = activeInspection.id;
    console.log("i_id", i_id);
    // Open the local report preview server with the real inspection id
    // (developer: change the host/port via env if your preview server runs elsewhere)
    
    //const url = `http://localhost:4321/view/${activeInspection.id}`;
    const url = `http://localhost:4321/view/9c6b71e5-5059-4f02-8ddd-2df015514972`;
    Linking.openURL(url);
  };
  //Not yet done or connected

  // https://inspection-report-topaz.vercel.app/view/lmquckr4ql

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
