import { useCameraPermissions, type CameraView } from 'expo-camera';
import CameraScreenView from './views/camera-screen-view';
import { useCameraScreen } from './hooks/use-camera-screen';
import type { Photo } from '../edit-observation/state';
import type { RefObject } from 'react';

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
  const props = useCameraScreen();

  if (!permission?.granted) {
    requestPermission();
    return;
  }

  if (permission?.granted) {
    return <CameraScreenView {...props} />;
  }
}
