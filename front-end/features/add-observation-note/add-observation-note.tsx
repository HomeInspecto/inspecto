import type { BottomSheetRef } from '@/components/views/bottom-sheet/bottom-sheet';
import { useObservationNotes } from './hooks/use-observation-note';
import { AddObservationNoteView } from './views/add-observation-note-view';

type AddObservationNoteProps = {
  bottomSheetRef?: React.RefObject<BottomSheetRef | null>;
};

export function AddObservationNote({ bottomSheetRef }: AddObservationNoteProps) {
  const props = useObservationNotes(bottomSheetRef);
  return <AddObservationNoteView {...props} />;
}
