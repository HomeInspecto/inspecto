import { InspectionsListView } from './inspections-list-view';
import { useInspectionsList } from './use-inspections-list';

export function InspectionsList() {
  const { inspections, onSelectInspection } = useInspectionsList();

  return <InspectionsListView inspections={inspections} onSelectInspection={onSelectInspection} />;
}
