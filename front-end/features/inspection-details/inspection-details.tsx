import { InspectionDetailsView } from './inspection-details-view';
import { useInspectionDetails } from './use-inspection-details';

export function InspectionDetails() {
  const props = useInspectionDetails();
  return <InspectionDetailsView {...props} />;
}
