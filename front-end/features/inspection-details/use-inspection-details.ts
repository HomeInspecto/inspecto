import { Linking } from 'react-native';
import { useActiveInspectionStore, type ActiveInspection } from './state';

export interface InspectionDetailsProps {
  inspection?: ActiveInspection;
  onCreateReport: () => void;
  onAddObservation: (/* placeholder - implement later */) => void;
}

export function useInspectionDetails(): InspectionDetailsProps {
  const inspection = useActiveInspectionStore(state => state.activeInspection);

  const onCreateReport = () => {
    if (!inspection) return;
    const url = `https://inspection-report-topaz.vercel.app/view/${inspection.id}`;
    Linking.openURL(url);
  };

  const onAddObservation = () => {
    // no-op placeholder; implementation to be added later
  };

  return {
    inspection,
    onCreateReport,
    onAddObservation,
  };
}
