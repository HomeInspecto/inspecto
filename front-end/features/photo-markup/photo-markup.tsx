import GalleryScreenView from './components/gallary-view';
import { useGalleryScreen } from './hooks/use-gallary-screen';

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
  selectedPhotos: Set<string>;
  fullscreenPhoto: Photo | null;

  // actions
  loadPhotos: () => void;
  goBack: () => void;
  handlePhotoPress: (p: Photo) => void;
  handleDeletePhoto: (id: string) => void;
  handleEditPhoto: (p: Photo) => void;
  handleCloseFullscreen: () => void;
  clearAllPhotos: () => void;

  // permissions
  permissionsLoading: boolean;
  permissionGranted: boolean;
  requestPermission: () => void;
  shouldCheckPermissions: boolean;
}

export default function PhotoMarkup() {
  const props = useGalleryScreen();
  return <GalleryScreenView {...props} />;
}
