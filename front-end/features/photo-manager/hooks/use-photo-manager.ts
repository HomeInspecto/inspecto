// useGalleryScreen.ts
import React from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import type { Photo, PhotoMarkupProps } from '../photo-manager';

export function usePhotoMarkup(): PhotoMarkupProps {
  // State management
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [fullscreenPhoto, setFullscreenPhoto] = React.useState<Photo | null>(null);

  // Expo Media Library permission (skip check on Android due to Expo Go limitations)
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const shouldCheckPermissions = Platform.OS === 'ios';
  const permissionsLoading = !permission;
  const permissionGranted = !!permission?.granted || !shouldCheckPermissions;

  // Load photos on mount
  React.useEffect(() => {
    loadPhotos();
  }, []);

  // Reload photos when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
    }, [])
  );

  // Load photos from AsyncStorage
  async function loadPhotos() {
    try {
      setLoading(true);


      // Load photos from storage
      const stored = await AsyncStorage.getItem('inspecto_photos');
      if (!stored) {
        setPhotos([]);
        return;
      }

      const list: Photo[] = JSON.parse(stored);

      // Filter valid photos by platform
      const valid = list.filter(p => {
        if (!p || !p.id || !p.uri || !p.timestamp) return false;

        if (Platform.OS === 'android') return p.uri.startsWith('file://');

        if (Platform.OS === 'ios')
          return (
            p.uri.startsWith('file://') ||
            p.uri.startsWith('content://') ||
            p.uri.startsWith('ph://')
          );

        if (Platform.OS === 'web')
          return (
            p.uri.startsWith('blob:') || p.uri.startsWith('file://') || p.uri.startsWith('data:')
          );

        return true;
      });

      // Sort by timestamp (newest first)
      valid.sort((a, b) => b.timestamp - a.timestamp);

      // Clean up invalid photos
      if (valid.length < list.length) {
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(valid));
      }

      setPhotos(valid);
      setFullscreenPhoto(valid[0]);
    } catch (e) {
      console.error('Error loading photos:', e);
      // Clear corrupted data
      try {
        await AsyncStorage.removeItem('inspecto_photos');
        await AsyncStorage.removeItem('last_gallery_visit');
        await AsyncStorage.removeItem('gallery_seen_timestamp');
      } catch {}
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }


  // Navigation
  function goBack() {
    router.back();
  }

  // Delete photo from storage and state
  async function handleDeletePhoto(photoId: string) {
    try {
      // Delete from media library (iOS only)
      if (Platform.OS === 'ios') {
        try {
          await MediaLibrary.deleteAssetsAsync([photoId]);
        } catch {}
      }

      // Remove from AsyncStorage
      const stored = await AsyncStorage.getItem('inspecto_photos');
      if (stored) {
        const list: Photo[] = JSON.parse(stored);
        const updated = list.filter(p => p.id !== photoId);
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(updated));
      }

      // Update state
      setPhotos(cur => cur.filter(p => p.id !== photoId));
      Alert.alert('Success', 'Photo deleted successfully.');
    } catch (e) {
      console.error('Error deleting photo:', e);
      Alert.alert('Error', 'Failed to delete photo.');
    }
  }

  // Open photo in editor
  function handleEditPhoto(photo: Photo) {
    setFullscreenPhoto(photo);
  }

  // Close editor
  function handleCloseFullscreen() {
    setFullscreenPhoto(null);
  }

  return {
    // state
    photos,
    loading,
    fullscreenPhoto,

    // actions
    loadPhotos,
    goBack,
    handleDeletePhoto,

    // permissions
    permissionsLoading,
    permissionGranted,
    requestPermission,
    shouldCheckPermissions,
  };
}
