import { InspectionsListView } from './inspections-list-view';
import { useInspectionsList } from './use-inspections-list';

export function InspectionsList() {
  return <InspectionsListView {...useInspectionsList()} />;
}
