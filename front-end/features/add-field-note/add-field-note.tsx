import type { BottomSheetRef } from '@/components/views/bottom-sheet/bottom-sheet';
import { useFieldNotes as useFieldNotes } from './hooks/use-field-note';
import { AddFieldNoteView } from './views/add-field-note-view';

type Props = {
  bottomSheetRef?: React.RefObject<BottomSheetRef | null>;
};

export function AddFieldNote({ bottomSheetRef }: Props) {
  const props = useFieldNotes(bottomSheetRef);
  return <AddFieldNoteView {...props} />;
}
