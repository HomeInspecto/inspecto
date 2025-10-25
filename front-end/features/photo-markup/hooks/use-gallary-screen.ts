// useGalleryScreen.ts
import React from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import type { Photo, PhotoMarkupProps } from '../photo-markup';

export function useGalleryScreen(): PhotoMarkupProps {
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastGalleryVisit, setLastGalleryVisit] = React.useState<number>(0);
  const [selectedPhotos, setSelectedPhotos] = React.useState<Set<string>>(new Set());
  const [fullscreenPhoto, setFullscreenPhoto] = React.useState<Photo | null>(null);

  // Expo Media Library permission (skip check on Android due to Expo Go limitations)
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const shouldCheckPermissions = Platform.OS === 'ios';
  const permissionsLoading = !permission;
  const permissionGranted = !!permission?.granted || !shouldCheckPermissions;

  React.useEffect(() => {
    loadPhotos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
      markGalleryAsSeen();
    }, [])
  );

  async function loadPhotos() {
    try {
      setLoading(true);

      const lastVisit = await AsyncStorage.getItem('last_gallery_visit');
      const lastVisitTime = lastVisit ? parseInt(lastVisit) : 0;
      setLastGalleryVisit(lastVisitTime);

      const stored = await AsyncStorage.getItem('inspecto_photos');
      if (!stored) {
        setPhotos([]);
        return;
      }

      const list: Photo[] = JSON.parse(stored);

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

      valid.sort((a, b) => b.timestamp - a.timestamp);

      if (valid.length < list.length) {
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(valid));
      }

      setPhotos(valid);
    } catch (e) {
      console.error('Error loading photos:', e);
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

  async function markGalleryAsSeen() {
    try {
      await AsyncStorage.setItem('gallery_seen_timestamp', Date.now().toString());
    } catch {}
  }

  function goBack() {
    router.back();
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      if (Platform.OS === 'ios') {
        try {
          await MediaLibrary.deleteAssetsAsync([photoId]);
        } catch {}
      }

      const stored = await AsyncStorage.getItem('inspecto_photos');
      if (stored) {
        const list: Photo[] = JSON.parse(stored);
        const updated = list.filter(p => p.id !== photoId);
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(updated));
      }

      setPhotos(cur => cur.filter(p => p.id !== photoId));
      Alert.alert('Success', 'Photo deleted successfully.');
    } catch (e) {
      console.error('Error deleting photo:', e);
      Alert.alert('Error', 'Failed to delete photo.');
    }
  }

  function handlePhotoPress(photo: Photo) {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      next.has(photo.id) ? next.delete(photo.id) : next.add(photo.id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedPhotos(new Set());
  }

  function handleEditPhoto(photo: Photo) {
    setFullscreenPhoto(photo);
  }

  function handleCloseFullscreen() {
    setFullscreenPhoto(null);
  }

  async function clearAllPhotos() {
    const hasSelected = selectedPhotos.size > 0;
    const msg = hasSelected
      ? `Delete ${selectedPhotos.size} selected photo${selectedPhotos.size > 1 ? 's' : ''}?`
      : 'Are you sure you want to delete all photos? This action cannot be undone.';

    if (Platform.OS === 'web') {
      const ok = window.confirm(msg);
      if (!ok) return;
      if (hasSelected) await performDeleteSelected();
      else await performClearAll();
    } else {
      const buttons: Array<{
        text: string;
        style?: 'cancel' | 'destructive';
        onPress?: () => void;
      }> = [
        { text: 'Cancel', style: 'cancel' },
        {
          text: hasSelected ? 'Delete Selected' : 'Clear All',
          style: 'destructive',
          onPress: async () => {
            if (hasSelected) await performDeleteSelected();
            else await performClearAll();
          },
        },
      ];
      if (hasSelected) {
        buttons.push({
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await performClearAll();
          },
        });
      }
      Alert.alert(hasSelected ? 'Delete Selected Photos' : 'Clear All Photos', msg, buttons);
    }
  }

  async function performDeleteSelected() {
    try {
      const stored = await AsyncStorage.getItem('inspecto_photos');
      if (!stored) return;

      const list: Photo[] = JSON.parse(stored);
      const updated = list.filter(p => !selectedPhotos.has(p.id));
      await AsyncStorage.setItem('inspecto_photos', JSON.stringify(updated));

      setPhotos(cur => cur.filter(p => !selectedPhotos.has(p.id)));
      setSelectedPhotos(new Set());

      Platform.OS === 'web'
        ? alert('Selected photos deleted.')
        : Alert.alert('Success', 'Selected photos deleted.');
    } catch (e) {
      console.error('Error deleting selected photos:', e);
      Platform.OS === 'web'
        ? alert('Failed to delete photos.')
        : Alert.alert('Error', 'Failed to delete photos.');
    }
  }

  async function performClearAll() {
    try {
      await AsyncStorage.removeItem('inspecto_photos');
      await AsyncStorage.removeItem('last_gallery_visit');
      await AsyncStorage.removeItem('gallery_seen_timestamp');

      setPhotos([]);
      setSelectedPhotos(new Set());

      Platform.OS === 'web'
        ? alert('All photos and data have been cleared.')
        : Alert.alert('Success', 'All photos and data have been cleared.');
    } catch (e) {
      console.error('Error clearing photos:', e);
      Platform.OS === 'web'
        ? alert('Failed to clear photos.')
        : Alert.alert('Error', 'Failed to clear photos.');
    }
  }

  return {
    // state
    photos,
    loading,
    lastGalleryVisit,
    selectedPhotos,
    fullscreenPhoto,

    // actions
    loadPhotos,
    goBack,
    handlePhotoPress,
    handleDeletePhoto,
    handleEditPhoto,
    handleCloseFullscreen,
    clearAllPhotos,

    // permissions
    permissionsLoading,
    permissionGranted,
    requestPermission,
    shouldCheckPermissions,
  };
}
