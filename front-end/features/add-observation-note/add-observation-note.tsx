import { useObservationNotes } from './hooks/use-observation-note';
import { AddObservationNoteView } from './views/add-observation-note-view';

export function AddObservationNote() {
  return <AddObservationNoteView {...useObservationNotes()} />;
}
