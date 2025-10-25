import GalleryScreenView from './components/gallary-view';
import { useGalleryScreen } from './hooks/use-gallary-screen';

export default function PhotoMarkup() {
  const props = useGalleryScreen();
  return <GalleryScreenView {...props} />;
}
