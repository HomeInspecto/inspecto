import { useFilmStrip } from './hooks/use-film-strip';
import { FilmStripView } from './views/film-strip-view';

export function FilmStrip() {
  return <FilmStripView {...useFilmStrip()} />;
}
