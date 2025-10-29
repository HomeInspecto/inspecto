import { useFieldNotes as useFieldNotes } from './hooks/use-field-note';
import { AddFieldNoteView } from './views/add-field-note-view';

type Props = {
  goToLogObservation: () => void;
};

export function AddFieldNote({ goToLogObservation }: Props) {
  const props = useFieldNotes(goToLogObservation);
  return <AddFieldNoteView {...props} />;
}
