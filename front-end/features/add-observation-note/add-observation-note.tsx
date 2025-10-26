import { useObservationNotes } from './hooks/use-observation-note';
import { AddObservationNoteView } from './views/add-observation-note-view';

export interface AddObservationProps {
  note?: string;

  onMicStart?: () => void;
  onMicStop?: () => void;
  onNextPress?: () => void;
}

export function AddObservationNote() {
  return <AddObservationNoteView {...useObservationNotes()} />;
}
