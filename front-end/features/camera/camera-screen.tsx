import { useCameraPermissions, type CameraView } from 'expo-camera';
import CameraScreenView from './views/camera-screen-view';
import { useCameraScreen } from './hooks/use-camera-screen';
import type { Photo } from '../edit-observation/state';
import type { RefObject } from 'react';

// ✅ NEW: imports for focus fix
import { View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export interface CameraScreenProps {
  photos: Photo[];

  cameraRef: RefObject<CameraView | null>;

  torch: boolean;
  takePhoto: () => void;
  toggleTorch: () => void;

  goBack: () => void;
  gotoEditPhotos: () => void;

  setZoom: (value: number) => void;
  displayZoom: number;
  currentZoomLabel: '1x' | '2x' | '3x';
  zoomLevels: Array<'1x' | '2x' | '3x'>;
  getZoomValue: (level: '1x' | '2x' | '3x') => number;
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const props = useCameraScreen();

  // Permission not loaded yet → render nothing
  if (!permission) {
    return null;
  }

  // Permission not granted → request and render nothing
  if (!permission.granted) {
    requestPermission();
    return null;
  }

  // Screen not focused → do NOT render the camera
  if (!isFocused) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  // Focused + permission granted → show the camera
  return <CameraScreenView {...props} />;
}
