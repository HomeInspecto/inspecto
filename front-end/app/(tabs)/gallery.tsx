import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform, Dimensions } from 'react-native';
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
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  
  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = screenWidth >= 768;
  
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
        if (Platform.OS === 'ios') {
          return photo.uri.startsWith('file://') || 
                 photo.uri.startsWith('content://') || 
                 photo.uri.startsWith('ph://');
        }
        
        // On web, allow blob: URIs (web camera photos)
        if (Platform.OS === 'web') {
          return photo.uri.startsWith('blob:') || 
                 photo.uri.startsWith('file://') ||
                 photo.uri.startsWith('data:');
        }
        
        // Default: allow all valid URIs
        return true;
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
    }
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      // Only try MediaLibrary deletion on iOS
      if (Platform.OS === 'ios') {
        try {
          await MediaLibrary.deleteAssetsAsync([photoId]);
        } catch (error) {
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
    // Toggle photo selection
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photo.id)) {
      newSelected.delete(photo.id);
    } else {
      newSelected.add(photo.id);
    }
    setSelectedPhotos(newSelected);
  }

  function clearSelection() {
    setSelectedPhotos(new Set());
  }


  async function clearAllPhotos() {
    const hasSelected = selectedPhotos.size > 0;
    const message = hasSelected 
      ? `Delete ${selectedPhotos.size} selected photo${selectedPhotos.size > 1 ? 's' : ''}?`
      : 'Are you sure you want to delete all photos? This action cannot be undone.';
    
    // Use web-compatible confirmation for web platform
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (!confirmed) return;
      
      if (hasSelected) {
        await performDeleteSelected();
      } else {
        await performClearAll();
      }
    } else {
      const buttons = [
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
        {
          text: hasSelected ? 'Delete Selected' : 'Clear All',
          style: 'destructive' as const,
          onPress: async () => {
            if (hasSelected) {
              await performDeleteSelected();
            } else {
              await performClearAll();
            }
          },
        },
      ];
      
      if (hasSelected) {
        buttons.push({
          text: 'Clear All',
          style: 'destructive' as const,
          onPress: async () => {
            await performClearAll();
          },
        });
      }
      
      Alert.alert(
        hasSelected ? 'Delete Selected Photos' : 'Clear All Photos',
        message,
        buttons
      );
      return;
    }
  }

  async function performDeleteSelected() {
    try {
      // Get current photos from AsyncStorage
      const storedPhotos = await AsyncStorage.getItem('inspecto_photos');
      if (!storedPhotos) return;
      
      const photoList = JSON.parse(storedPhotos);
      const updatedPhotos = photoList.filter((photo: Photo) => !selectedPhotos.has(photo.id));
      
      // Update AsyncStorage
      await AsyncStorage.setItem('inspecto_photos', JSON.stringify(updatedPhotos));
      
      // Update local state - maintain the same order as in AsyncStorage
      // Don't re-sort, just filter out the deleted photos
      const currentPhotos = photos.filter(photo => !selectedPhotos.has(photo.id));
      setPhotos(currentPhotos);
      setSelectedPhotos(new Set());
      
      if (Platform.OS === 'web') {
        alert(`${selectedPhotos.size} photo${selectedPhotos.size > 1 ? 's' : ''} deleted.`);
      } else {
        Alert.alert('Success', `${selectedPhotos.size} photo${selectedPhotos.size > 1 ? 's' : ''} deleted.`);
      }
    } catch (error) {
      console.error('Error deleting selected photos:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete photos.');
      } else {
        Alert.alert('Error', 'Failed to delete photos.');
      }
    }
  }

  async function performClearAll() {
    try {
      // Clear all app data to prevent crashes
      await AsyncStorage.removeItem('inspecto_photos');
      await AsyncStorage.removeItem('last_gallery_visit');
      await AsyncStorage.removeItem('gallery_seen_timestamp');
      
      // Clear local state
      setPhotos([]);
      setSelectedPhotos(new Set());
      
      if (Platform.OS === 'web') {
        alert('All photos and data have been cleared.');
      } else {
        Alert.alert('Success', 'All photos and data have been cleared.');
      }
    } catch (error) {
      console.error('Error clearing photos:', error);
      if (Platform.OS === 'web') {
        alert('Failed to clear photos.');
      } else {
        Alert.alert('Error', 'Failed to clear photos.');
      }
    }
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
      <View 
        style={[styles.header, isWeb && styles.headerWeb]}
        accessibilityRole="header"
        accessibilityLabel="Photo Gallery Header"
      >
        <TouchableOpacity 
          style={[styles.backButton, isWeb && styles.backButtonWeb]}
          onPress={() => router.back()}
        >
          <IconSymbol 
            name="chevron.left" 
            size={isWeb ? (isLargeScreen ? 28 : 24) : 24} 
            color="#007AFF" 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isWeb && styles.headerTitleWeb]}>
          Photo Gallery
        </Text>
        <View style={[styles.headerActions, isWeb && styles.headerActionsWeb]}>
          <TouchableOpacity 
            style={[styles.refreshButton, isWeb && styles.refreshButtonWeb]}
            onPress={loadPhotos}
          >
            <IconSymbol 
              name="arrow.clockwise" 
              size={isWeb ? (isLargeScreen ? 28 : 24) : 24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.clearButton, isWeb && styles.clearButtonWeb]}
          onPress={clearAllPhotos}
        >
          <IconSymbol 
            name="trash" 
            size={isWeb ? (isLargeScreen ? 28 : 24) : 24} 
            color="#FF3B30" 
          />
          {selectedPhotos.size > 0 && (
            <View style={styles.selectionCount}>
              <Text style={styles.selectionCountText}>{selectedPhotos.size}</Text>
            </View>
          )}
        </TouchableOpacity>
        </View>
      </View>

          <View 
            style={styles.content}
            accessibilityRole="none"
            accessibilityLabel="Photo Gallery"
          >
            <PhotoGallery
              photos={photos}
              onPhotoPress={handlePhotoPress}
              onDeletePhoto={handleDeletePhoto}
              lastGalleryVisit={lastGalleryVisit}
              selectedPhotos={selectedPhotos}
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
  headerWeb: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  backButtonWeb: {
    padding: 12,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerTitleWeb: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionsWeb: {
    gap: 8,
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonWeb: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonWeb: {
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  selectionCount: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  selectionCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
