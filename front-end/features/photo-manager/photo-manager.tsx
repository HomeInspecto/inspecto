import PhotoManagerView from './views/photo-manager-view';
import { usePhotoManager } from './hooks/use-photo-manager';

export type Photo = {
  id: string;
  uri: string;
  timestamp: number;
};

export interface PhotoManagerProps {
  // state
  photos: Photo[];
  loading: boolean;
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

export default function PhotoManager() {
  const props = usePhotoManager();
  return <PhotoManagerView {...props} />;
}
