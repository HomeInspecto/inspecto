import { InspectionsListView } from './inspections-list-view';
import { useInspections } from './use-inspections';

export function InspectionsList() {
  const { inspections, selectInspection } = useInspections();

  return <InspectionsListView inspections={inspections} onSelect={selectInspection} />;
}
