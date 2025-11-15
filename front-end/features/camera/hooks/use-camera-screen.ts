import { Alert } from 'react-native';
import { CameraView, type FlashMode } from 'expo-camera';
import type { CameraScreenProps } from '../camera-screen';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/shallow';

export function useCameraScreen(): CameraScreenProps {
  const { id } = useLocalSearchParams<{ id: string }>();

  const clearObservation = useActiveObservationStore(useShallow(s => s.clearObservation));

  const cameraRef = useRef<CameraView>(null);
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoomState] = useState(0);

  const { photos, addPhoto } = useActiveObservationStore(
    useShallow(state => ({
      photos: state.photos,
      addPhoto: state.addPhoto,
    }))
  );

  // Example: Add a new photo
  function handleAddPhoto(newUri: string) {
    const newPhoto = {
      id: `photo_${Date.now()}`,
      uri: newUri,
      timestamp: Date.now(),
    };
    addPhoto(newPhoto);
  }

  const setZoom = (value: number) => {
    setZoomState(Math.max(0, Math.min(1, value)));
  };

  // Zoom level logic
  const zoomLevels: Array<'.5x' | '1x' | '1.5x' | '2x'> = ['.5x', '1x', '1.5x', '2x'];

  const getZoomLevel = (zoomValue: number): '.5x' | '1x' | '1.5x' | '2x' => {
    if (zoomValue == 0) return '.5x';
    if (zoomValue == 0.15) return '1x';
    if (zoomValue == 0.25) return '1.5x';
    return '2x';
  };

  const getZoomValue = (level: '.5x' | '1x' | '1.5x' | '2x'): number => {
    switch (level) { case '.5x': return 0; case '1x': return 0.15; case '1.5x': return 0.25; case '2x': return 0.4; }
  };

  const cycleZoom = () => {
    const currentLevel = getZoomLevel(zoom);
    let nextLevel: '.5x' | '1x' | '1.5x' | '2x';
    
    switch (currentLevel) {
      case '.5x': nextLevel = '1x'; break;
      case '1x': nextLevel = '1.5x'; break;
      case '1.5x': nextLevel = '2x'; break;
      case '2x': nextLevel = '.5x'; break;
    }
    
    setZoom(getZoomValue(nextLevel));
  };

  const currentZoomLabel = getZoomLevel(zoom);

  const isTakingRef = useRef(false);

  const takePhoto = () => {
    if (isTakingRef.current) return;
    isTakingRef.current = true;

    (async () => {
      const camera = cameraRef.current;
      if (!camera) {
        isTakingRef.current = false;
        return;
      }
      try {
        const photo = await camera.takePictureAsync?.({ quality: 0.8, base64: false });
        if (photo?.uri) {
          handleAddPhoto(photo.uri);
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        // allow taking another photo after this operation completes
        isTakingRef.current = false;
      }
    })();
  };

  const toggleFlash = () => {
    setFlash(prev => (prev === 'off' ? 'on' : 'off'));
  };

  const goBack = () => {
    clearObservation();
    router.push('/');
  };
  const gotoEditPhotos = () => {
    router.push(`/active-inspection/${id}/edit-observation`);
  };

  return {
    photos,

    cameraRef,

    goBack,
    gotoEditPhotos,

    flash,
    toggleFlash,
    takePhoto,

    zoom,
    setZoom,
    cycleZoom,
    currentZoomLabel,
    zoomLevels,
  };
}
