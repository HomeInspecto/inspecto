import { useLogObersation } from './hooks/use-log-observation';
import { LogObservationView } from './views/log-observation-view';

export function LogObservation() {
  return <LogObservationView {...useLogObersation()} />;
}
