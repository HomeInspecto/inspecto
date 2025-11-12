import { ObservationDetailsView } from './views/observation-details-view';
import { useObservationDetails } from './hooks/use-observation-details';

export function ObservationDetails() {
  const props = useObservationDetails();
  return <ObservationDetailsView {...props} />;
}

