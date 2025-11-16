import { InspectionDetailsView } from './views/inspection-details-view';
import { useInspectionDetails } from './hooks/use-inspection-details';

export function InspectionDetails() {
  const props = useInspectionDetails();
  return <InspectionDetailsView {...props} />;
}
