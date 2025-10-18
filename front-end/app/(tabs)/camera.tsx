import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, PanResponder } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [newPhotoCount, setNewPhotoCount] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  // Load new photo count on mount
  useEffect(() => {
    loadNewPhotoCount();
  }, []);

  // Reset new photo count when returning from gallery
  useFocusEffect(
    React.useCallback(() => {
      loadNewPhotoCount();
      // Mark gallery as visited when returning to camera
      markGalleryAsVisited();
    }, [])
  );

  async function loadNewPhotoCount() {
    try {
      const gallerySeenTimestamp = await AsyncStorage.getItem('gallery_seen_timestamp');
      const allPhotos = await AsyncStorage.getItem('inspecto_photos');
      
      if (!allPhotos) {
        setNewPhotoCount(0);
        return;
      }
      
      const photos = JSON.parse(allPhotos);
      const lastSeenTime = gallerySeenTimestamp ? parseInt(gallerySeenTimestamp) : 0;
      const newPhotos = photos.filter((photo: any) => photo.timestamp > lastSeenTime);
      
      setNewPhotoCount(newPhotos.length);
    } catch (error) {
      console.log('Error loading new photo count:', error);
      setNewPhotoCount(0);
    }
  }

  async function markGalleryAsVisited() {
    try {
      const currentTime = Date.now().toString();
      await AsyncStorage.setItem('last_gallery_visit', currentTime);
    } catch (error) {
      console.log('Error marking gallery as visited:', error);
    }
  }

  if (!permission || !mediaLibraryPermission) {
    // Permissions are still loading
    return <View style={styles.container}><Text>Loading permissions...</Text></View>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mediaLibraryPermission.granted) {
    // Media library permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need permission to save photos to your device</Text>
        <TouchableOpacity style={styles.button} onPress={requestMediaLibraryPermission}>
          <Text style={styles.buttonText}>Grant Photo Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.numberActiveTouches >= 2;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.numberActiveTouches >= 2;
    },
    onPanResponderGrant: () => {
      // Start of pinch gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.numberActiveTouches === 2) {
        // Calculate distance between two fingers
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) + 
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );
          
          // Use distance to calculate zoom
          const baseDistance = 200; // Base distance for 1x zoom
          const scale = distance / baseDistance;
          const newZoom = Math.max(0, Math.min(1, (scale - 1) * 0.5));
          setZoom(newZoom);
        }
      }
    },
    onPanResponderRelease: () => {
      // End of pinch gesture
    },
  });

  async function takePicture() {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          // Save to media library
          const asset = await MediaLibrary.createAssetAsync(photo.uri);
          
          // Store photo info in AsyncStorage for app-specific tracking
          try {
            const photoData = {
              id: asset.id,
              uri: asset.uri,
              timestamp: Date.now(),
              filename: asset.filename || `inspecto_${Date.now()}.jpg`
            };
            
            const existingPhotos = await AsyncStorage.getItem('inspecto_photos');
            const photos = existingPhotos ? JSON.parse(existingPhotos) : [];
            photos.push(photoData);
            await AsyncStorage.setItem('inspecto_photos', JSON.stringify(photos));
          } catch (error) {
            console.log('Could not store photo data:', error);
          }
          
          // Increment new photo count
          setNewPhotoCount(prev => prev + 1);
          setIsCapturing(false);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
        setIsCapturing(false);
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer} {...panResponder.panHandlers}>
        <CameraView 
          style={styles.camera} 
          facing={facing}
          zoom={zoom}
          ref={cameraRef}
        />
        
        {/* Zoom Indicator */}
        {zoom > 0 && (
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>{Math.round((zoom + 1) * 100)}%</Text>
          </View>
        )}
      </View>
      
      {/* Camera Controls Overlay - Positioned absolutely */}
      <View style={styles.controlsContainer}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleCameraFacing}
          >
            <IconSymbol name="arrow.triangle.2.circlepath" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                isCapturing && styles.captureButtonDisabled
              ]}
              onPress={takePicture}
              disabled={isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* New Photo Counter */}
      {newPhotoCount > 0 && (
        <TouchableOpacity 
          style={styles.newPhotoCounter}
          onPress={() => router.push('/(tabs)/gallery')}
        >
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{newPhotoCount}</Text>
          </View>
          <Text style={styles.counterLabel}>
            {newPhotoCount === 1 ? 'new photo' : 'new photos'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoomText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  bottomControls: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  newPhotoCounter: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  counterBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  counterLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
