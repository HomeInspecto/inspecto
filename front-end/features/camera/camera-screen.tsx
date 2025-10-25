import type { CameraView } from 'expo-camera';
import CameraScreenView from './views/camera-screen-view';
import { useCameraScreen } from './hooks/use-camera-screen';

export interface CameraScreenProps {
  // state
  facing: 'front' | 'back';
  isCapturing: boolean;
  zoom: number;
  newPhotoCount: number;
  isCameraActive: boolean;
  cameraRef: React.RefObject<CameraView | null>;
  panHandlers: any;

  // actions
  toggleCameraFacing: () => void;
  takePicture: () => void;
  goBack: () => void;
  gotoEditPhotos: () => void;

  // permissions
  permissionsLoading: boolean;
  cameraGranted: boolean;
  mediaGranted: boolean;
  requestCameraPermission: () => void;
  requestMediaPermission: () => void;
  shouldCheckMediaLibraryPermissions: boolean;
}

export default function CameraScreen() {
  const props = useCameraScreen();
  return <CameraScreenView {...props} />;
}
