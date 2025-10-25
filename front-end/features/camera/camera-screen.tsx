import CameraScreenView from './components/camera-screen-view';
import { useCameraScreen } from './hooks/use-camera-screen';

export default function CameraScreen() {
  const hook = useCameraScreen();
  return <CameraScreenView {...hook} />;
}
