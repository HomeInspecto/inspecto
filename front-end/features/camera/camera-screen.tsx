import { useCameraPermissions, type CameraView, type FlashMode } from 'expo-camera';
import CameraScreenView from './views/camera-screen-view';
import { useCameraScreen } from './hooks/use-camera-screen';
import type { Photo } from '../edit-observation/state';
import type { Dispatch, SetStateAction } from 'react';

export interface CameraScreenProps {
  photos: Photo[];

  setCamera: Dispatch<SetStateAction<CameraView | null>>;

  flash: FlashMode;
  takePhoto: () => void;
  toggleFlash: () => void;

  goBack: () => void;
  gotoEditPhotos: () => void;
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
