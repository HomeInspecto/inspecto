import PhotoMarkupView from './components/photo-markup-view';
import { usePhotoMarkup } from './hooks/use-photo-markup';

export type Photo = {
  id: string;
  uri: string;
  timestamp: number;
};

export interface PhotoMarkupProps {
  // state
  photos: Photo[];
  loading: boolean;
  lastGalleryVisit: number;
  fullscreenPhoto: Photo | null;

  // actions
  loadPhotos: () => void;
  goBack: () => void;
  handleDeletePhoto: (id: string) => void;

  // permissions
  permissionsLoading: boolean;
  permissionGranted: boolean;
  requestPermission: () => void;
  shouldCheckPermissions: boolean;
}

export default function PhotoMarkup() {
  const props = usePhotoMarkup();
  return <PhotoMarkupView {...props} />;
}
