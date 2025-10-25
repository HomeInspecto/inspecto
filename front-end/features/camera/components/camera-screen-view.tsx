// CameraScreenView.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  // state
  facing: 'front' | 'back';
  isCapturing: boolean;
  zoom: number;
  newPhotoCount: number;
  isCameraActive: boolean;
  cameraRef: React.RefObject<CameraView | null>;
  panHandlers: any;

  // actions
  toggleCameraFacing: () => void;
  takePicture: () => void;
  goBack: () => void;
  openGallery: () => void;

  // permissions
  permissionsLoading: boolean;
  cameraGranted: boolean;
  mediaGranted: boolean;
  requestCameraPermission: () => void;
  requestMediaPermission: () => void;
  shouldCheckMediaLibraryPermissions: boolean;
};

export default function CameraScreenView(props: Props) {
  const {
    facing,
    isCapturing,
    zoom,
    newPhotoCount,
    isCameraActive,
    cameraRef,
    panHandlers,
    toggleCameraFacing,
    takePicture,
    goBack,
    openGallery,
    permissionsLoading,
    cameraGranted,
    mediaGranted,
    requestCameraPermission,
    requestMediaPermission,
    shouldCheckMediaLibraryPermissions,
  } = props;

  if (permissionsLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading permissions...</Text>
      </View>
    );
  }

  if (!cameraGranted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
            <Text style={styles.buttonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!mediaGranted && shouldCheckMediaLibraryPermissions) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>We need permission to save photos to your device</Text>
          <TouchableOpacity style={styles.button} onPress={requestMediaPermission}>
            <Text style={styles.buttonText}>Grant Photo Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer} {...panHandlers}>
        {isCameraActive ? (
          <CameraView style={styles.camera} facing={facing} zoom={zoom} ref={cameraRef} />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraPlaceholderText}>Camera Inactive</Text>
          </View>
        )}

        {zoom > 0 && (
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>{Math.round((zoom + 1) * 100)}%</Text>
          </View>
        )}
      </View>

      {/* overlay controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={goBack}>
            <IconSymbol name="xmark" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {newPhotoCount > 0 && (
        <TouchableOpacity style={styles.newPhotoCounter} onPress={openGallery}>
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
  container: { flex: 1, backgroundColor: 'black' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  zoomIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoomText: { color: 'white', fontSize: 14, fontWeight: '600' },
  message: { textAlign: 'center', paddingBottom: 10, color: 'white', fontSize: 16 },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 120,
    paddingHorizontal: 20,
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
  bottomControls: { paddingBottom: 50, alignItems: 'center' },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureContainer: { alignItems: 'center' },
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
  captureButtonDisabled: { opacity: 0.5 },
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
  counterText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  counterLabel: { color: 'white', fontSize: 12, fontWeight: '500' },
});
