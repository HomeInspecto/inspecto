import { Linking } from 'react-native';
import { useActiveInspectionStore, type ActiveInspection } from './state';
import { Observation, useActiveObservationStore } from '../edit-observation/state';
import { useShallow } from 'zustand/react/shallow';
import type { InspectionDetailsViewProps } from './inspection-details-view';

export function useInspectionDetails(): InspectionDetailsViewProps {
  const { activeInspection } = useActiveInspectionStore(useShallow(state => (
    {
      activeInspection: state.activeInspection
    })
  ));


  const onCreateReport = () => {
    if (!activeInspection) return;
    const url = `https://inspection-report-topaz.vercel.app/view/${activeInspection.id}`;
    Linking.openURL(url);
  };



  return {
    inspection: activeInspection,
    onCreateReport
  };
}
