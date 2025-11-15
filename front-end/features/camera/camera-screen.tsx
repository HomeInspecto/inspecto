import { useCameraPermissions, type CameraView, type FlashMode } from 'expo-camera';
import CameraScreenView from './views/camera-screen-view';
import { useCameraScreen } from './hooks/use-camera-screen';
import type { Photo } from '../edit-observation/state';
import type { RefObject } from 'react';

export interface CameraScreenProps {
  photos: Photo[];

  cameraRef: RefObject<CameraView | null>;

  flash: FlashMode;
  takePhoto: () => void;
  toggleFlash: () => void;

  goBack: () => void;
  gotoEditPhotos: () => void;

  zoom: number;
  setZoom: (value: number) => void;
  cycleZoom: () => void;
  currentZoomLabel: '.5x' | '1x' | '1.5x' | '2x';
  zoomLevels: Array<'.5x' | '1x' | '1.5x' | '2x'>;
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
