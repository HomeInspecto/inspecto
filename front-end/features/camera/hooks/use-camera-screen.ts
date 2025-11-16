import { Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import type { CameraScreenProps } from '../camera-screen';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/shallow';

export function useCameraScreen(): CameraScreenProps {
  const { id } = useLocalSearchParams<{ id: string }>();

  const clearObservation = useActiveObservationStore(useShallow(s => s.clearObservation));

  const cameraRef = useRef<CameraView>(null);
  const [torch, setTorch] = useState(false);
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
  const zoomLevels: Array<'1x' | '2x' | '3x'> = ['1x', '2x', '3x'];

  const getZoomLevel = (zoomValue: number): '1x' | '2x' | '3x' => {
    if (zoomValue == 0) return '1x';
    if (zoomValue == 0.15) return '2x';
    return '3x';
  };

  const getZoomValue = (level: '1x' | '2x' | '3x'): number => {
    switch (level) { case '1x': return 0; case '2x': return 0.15; case '3x': return 0.25; }
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

  const toggleTorch = () => {
    setTorch(prev => !prev);
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

    torch,
    toggleTorch,
    takePhoto,

    zoom,
    setZoom,
    currentZoomLabel,
    zoomLevels,
    getZoomValue,
  };
}
