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

  const takePhoto = () => {
    (async () => {
      const camera = cameraRef.current;
      if (!camera) return;
      try {
        const photo = await camera.takePictureAsync?.({ quality: 0.8, base64: false });
        if (photo?.uri) {
          handleAddPhoto(photo?.uri);
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
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
  };
}
