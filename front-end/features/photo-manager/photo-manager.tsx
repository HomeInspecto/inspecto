import PhotoManagerView from './views/photo-manager-view';
import { usePhotoManager } from './hooks/use-photo-manager';
import { View } from 'react-native';
import PhotoEditor from '../photo-editor/photo-editor';
import { COLORS } from '@/constants/colors';
import { StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pageBackground },
});

export default function PhotoManager() {
  const props = usePhotoManager();

  return <PhotoManagerView {...props} />;
}
