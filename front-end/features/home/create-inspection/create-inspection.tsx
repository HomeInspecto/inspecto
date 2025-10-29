import { CreateInspectionView } from './create-inspection-view';
import { useCreateInspection } from './use-create-inspection';

export function CreateInspection() {
  return <CreateInspectionView {...useCreateInspection()} />;
}
