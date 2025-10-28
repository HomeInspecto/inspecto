import { useActiveObservationStore } from '@/features/edit-observation/state';
import type { FilmStripViewProps } from '../views/film-strip-view';
import { useShallow } from 'zustand/react/shallow';

export function useFilmStrip(): FilmStripViewProps {
  const photos = useActiveObservationStore(useShallow(state => state.photos));
  const activePhotoIndex = useActiveObservationStore(useShallow(state => state.activePhotoIndex));
  console.log(photos);

  return {
    activePhotoIndex,
    photos,
  };
}
