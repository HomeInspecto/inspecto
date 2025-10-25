import { Alert, PanResponder, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import type { CameraScreenProps } from '../camera-screen';

export function useCameraScreen(): CameraScreenProps {
  const [facing, setFacing] = React.useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [zoom, setZoom] = React.useState(0);
  const [newPhotoCount, setNewPhotoCount] = React.useState(0);
  const [isCameraActive, setIsCameraActive] = React.useState(true);
  const cameraRef = React.useRef<CameraView>(null);
  const { id } = useLocalSearchParams<{ id: string }>();

  // Media library (iOS only requirement)
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const shouldCheckMediaLibraryPermissions = Platform.OS === 'ios';

  // Load new photo count on mount
  React.useEffect(() => {
    loadNewPhotoCount();
  }, []);

  // Reset capturing state on unmount
  React.useEffect(() => {
    return () => setIsCapturing(false);
  }, []);

  // Refresh counts and mark gallery as visited when refocusing
  useFocusEffect(
    React.useCallback(() => {
      loadNewPhotoCount();
      markGalleryAsVisited();
    }, [])
  );

  // Manage camera active/inactive by focus
  useFocusEffect(
    React.useCallback(() => {
      setIsCameraActive(true);
      setIsCapturing(false);
      return () => {
        setIsCameraActive(false);
        setZoom(0);
      };
    }, [])
  );

  async function loadNewPhotoCount() {
    try {
      const gallerySeenTimestamp = await AsyncStorage.getItem('gallery_seen_timestamp');
      const allPhotos = await AsyncStorage.getItem('inspecto_photos');
      if (!allPhotos) return setNewPhotoCount(0);

      const photos = JSON.parse(allPhotos);
      const lastSeenTime = gallerySeenTimestamp ? parseInt(gallerySeenTimestamp) : 0;
      const newer = photos.filter((p: any) => p.timestamp > lastSeenTime);
      setNewPhotoCount(newer.length);
    } catch {
      setNewPhotoCount(0);
    }
  }

  async function markGalleryAsVisited() {
    try {
      await AsyncStorage.setItem('last_gallery_visit', Date.now().toString());
    } catch {
      /* ignore */
    }
  }

  function toggleCameraFacing() {
    setFacing(cur => (cur === 'back' ? 'front' : 'back'));
  }

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_evt, g) => g.numberActiveTouches >= 2,
        onMoveShouldSetPanResponder: (_evt, g) => g.numberActiveTouches >= 2,
        onPanResponderMove: (evt, _gestureState) => {
          const touches = evt.nativeEvent.touches;
          if (touches.length === 2) {
            const [t1, t2] = touches;
            const dx = t2.pageX - t1.pageX;
            const dy = t2.pageY - t1.pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const base = 200;
            const scale = distance / base;
            const newZoom = Math.max(0, Math.min(1, (scale - 1) * 0.5));
            setZoom(newZoom);
          }
        },
      }),
    []
  );

  async function takePicture() {
    if (!cameraRef.current || isCapturing || !isCameraActive) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      if (photo) {
        const asset = {
          id: `photo_${Date.now()}`,
          uri: photo.uri,
          filename: `inspecto_${Date.now()}.jpg`,
        };

        // Track in app storage
        try {
          const item = {
            id: asset.id,
            uri: asset.uri,
            timestamp: Date.now(),
            filename: asset.filename,
          };
          const existing = await AsyncStorage.getItem('inspecto_photos');
          const photos = existing ? JSON.parse(existing) : [];
          photos.push(item);
          await AsyncStorage.setItem('inspecto_photos', JSON.stringify(photos));
        } catch {
          /* ignore */
        }

        setNewPhotoCount(n => n + 1);
      }
    } catch (e) {
      console.error('Error taking picture:', e);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }

  function goBack() {
    router.back();
  }

  function gotoEditPhotos() {
    router.push(`/active-inspection/${id}/edit-observation`);
  }

  const permissionsLoading = !permission || !mediaLibraryPermission;
  const cameraGranted = !!permission?.granted;
  const mediaGranted = !!mediaLibraryPermission?.granted || !shouldCheckMediaLibraryPermissions;

  return {
    // state
    facing,
    isCapturing,
    zoom,
    newPhotoCount,
    isCameraActive,
    cameraRef,
    panHandlers: panResponder.panHandlers,

    // actions
    toggleCameraFacing,
    takePicture,
    goBack,
    gotoEditPhotos,

    // permissions (for View to render)
    permissionsLoading,
    cameraGranted,
    mediaGranted,
    requestCameraPermission: requestPermission,
    requestMediaPermission: requestMediaLibraryPermission,
    shouldCheckMediaLibraryPermissions,
  };
}
