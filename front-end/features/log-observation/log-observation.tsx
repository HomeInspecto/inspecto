import { useLogObersation } from './hooks/use-log-observation';
import { LogObservationView } from './views/log-observation-view';

export function LogObservation({ isStandalone }: { isStandalone?: boolean }) {
  return <LogObservationView {...useLogObersation(isStandalone)} isStandalone={isStandalone} />;
}
