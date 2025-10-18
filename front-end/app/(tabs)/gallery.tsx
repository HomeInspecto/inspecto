import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PhotoGallery from '@/components/photo-gallery';

import * as MediaLibrary from 'expo-media-library';

interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastGalleryVisit, setLastGalleryVisit] = useState<number>(0);
  
  // Always call the hook, but handle platform differences in logic
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  
  // Handle platform-specific permission logic
  const shouldCheckPermissions = Platform.OS === 'ios';

  useEffect(() => {
    loadPhotos();
  }, []);

  // Refresh photos when the gallery screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
      // Mark gallery as seen for counter reset (but don't affect highlighting)
      markGalleryAsSeen();
    }, [])
  );

  async function loadPhotos() {
    try {
      setLoading(true);

      // Load last gallery visit time
      const lastVisit = await AsyncStorage.getItem('last_gallery_visit');
      const lastVisitTime = lastVisit ? parseInt(lastVisit) : 0;
      setLastGalleryVisit(lastVisitTime);
      
      console.log('Gallery: Last visit time:', lastVisitTime);

      // Load photos from AsyncStorage (app-specific photos)
      const storedPhotos = await AsyncStorage.getItem('inspecto_photos');

      if (!storedPhotos) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      const photoList: Photo[] = JSON.parse(storedPhotos);

      // Filter out invalid photos and validate data
      const validPhotos = photoList.filter(photo => {
        if (!photo || !photo.id || !photo.uri || !photo.timestamp) {
          return false;
        }
        
        // On Android, only allow file:// URIs (local files)
        if (Platform.OS === 'android') {
          return photo.uri.startsWith('file://');
        }
        
        // On iOS, allow all valid URIs
        return photo.uri.startsWith('file://') || 
               photo.uri.startsWith('content://') || 
               photo.uri.startsWith('ph://');
      });

      // Sort by timestamp (newest first)
      validPhotos.sort((a, b) => b.timestamp - a.timestamp);
      
      // If we filtered out invalid photos, save the cleaned data
      if (validPhotos.length < photoList.length) {
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(validPhotos));
      }

      setPhotos(validPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      // If there's a persistent error, clear the corrupted data
      try {
        await AsyncStorage.removeItem('inspecto_photos');
        await AsyncStorage.removeItem('last_gallery_visit');
        await AsyncStorage.removeItem('gallery_seen_timestamp');
      } catch (clearError) {
        console.log('Error clearing data:', clearError);
      }
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }


  async function markGalleryAsSeen() {
    try {
      const currentTime = Date.now().toString();
      await AsyncStorage.setItem('gallery_seen_timestamp', currentTime);
    } catch (error) {
      console.log('Error marking gallery as seen:', error);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      // Only try MediaLibrary deletion on iOS
      if (Platform.OS === 'ios') {
        try {
          await MediaLibrary.deleteAssetsAsync([photoId]);
        } catch (error) {
          console.log('MediaLibrary delete error (continuing anyway):', error);
        }
      }
      
      // Remove from AsyncStorage
      const storedPhotos = await AsyncStorage.getItem('inspecto_photos');
      if (storedPhotos) {
        const photoList = JSON.parse(storedPhotos);
        const updatedPhotos = photoList.filter((photo: Photo) => photo.id !== photoId);
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(updatedPhotos));
      }
      
      // Update local state
      setPhotos(photos.filter(photo => photo.id !== photoId));
      Alert.alert('Success', 'Photo deleted successfully.');
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete photo.');
    }
  }

  function handlePhotoPress(photo: Photo) {
    // TODO: Navigate to photo editor or full-screen view
    Alert.alert('Photo Selected', `Photo ID: ${photo.id}`);
  }

  async function clearAllPhotos() {
    Alert.alert(
      'Clear All Photos',
      'Are you sure you want to delete all photos? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all app data to prevent crashes
              await AsyncStorage.removeItem('inspecto_photos');
              await AsyncStorage.removeItem('last_gallery_visit');
              await AsyncStorage.removeItem('gallery_seen_timestamp');
              
              // Clear local state
              setPhotos([]);
              
              Alert.alert('Success', 'All photos and data have been cleared.');
            } catch (error) {
              console.error('Error clearing photos:', error);
              Alert.alert('Error', 'Failed to clear photos.');
            }
          },
        },
      ]
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Loading permissions...</Text>
      </View>
    );
  }

  // Handle permissions - skip check on Android due to Expo Go limitations
  if (!permission.granted && shouldCheckPermissions) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <IconSymbol name="photo" size={64} color="#ccc" />
          <Text style={styles.permissionTitle}>Photo Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your photos to show them in the gallery.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadPhotos}
        >
          <IconSymbol name="arrow.clockwise" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearAllPhotos}
        >
          <IconSymbol name="trash" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

          <View style={styles.content}>
            <PhotoGallery
              photos={photos}
              onPhotoPress={handlePhotoPress}
              onDeletePhoto={handleDeletePhoto}
              lastGalleryVisit={lastGalleryVisit}
            />
          </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
