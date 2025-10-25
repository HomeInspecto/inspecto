// GalleryScreenView.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PhotoGallery from '@/components/photo-gallery';
import PhotoEditor from '@/components/photo-editor';
import type { Photo } from '../hooks/use-gallary-screen';

type Props = {
  // state
  photos: Photo[];
  loading: boolean;
  lastGalleryVisit: number;
  selectedPhotos: Set<string>;
  fullscreenPhoto: Photo | null;

  // actions
  loadPhotos: () => void;
  goBack: () => void;
  handlePhotoPress: (p: Photo) => void;
  handleDeletePhoto: (id: string) => void;
  handleEditPhoto: (p: Photo) => void;
  handleCloseFullscreen: () => void;
  clearAllPhotos: () => void;

  // permissions
  permissionsLoading: boolean;
  permissionGranted: boolean;
  requestPermission: () => void;
  shouldCheckPermissions: boolean;
};

export default function GalleryScreenView(props: Props) {
  const {
    photos,
    loading,
    lastGalleryVisit,
    selectedPhotos,
    fullscreenPhoto,
    loadPhotos,
    goBack,
    handlePhotoPress,
    handleDeletePhoto,
    handleEditPhoto,
    handleCloseFullscreen,
    clearAllPhotos,
    permissionsLoading,
    permissionGranted,
    requestPermission,
    shouldCheckPermissions,
  } = props;

  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = screenWidth >= 768;

  if (permissionsLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading permissions...</Text>
      </View>
    );
  }

  if (!permissionGranted && shouldCheckPermissions) {
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
      {/* Header */}
      <View
        style={[styles.header, isWeb && styles.headerWeb]}
        accessibilityRole="header"
        accessibilityLabel="Photo Gallery Header"
      >
        <TouchableOpacity
          style={[styles.backButton, isWeb && styles.backButtonWeb]}
          onPress={goBack}
        >
          <IconSymbol
            name="chevron.left"
            size={isWeb ? (isLargeScreen ? 28 : 24) : 24}
            color="#007AFF"
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isWeb && styles.headerTitleWeb]}>Photo Gallery</Text>

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

      {/* Content */}
      <View style={styles.content} accessibilityRole="none" accessibilityLabel="Photo Gallery">
        <PhotoGallery
          photos={photos}
          onPhotoPress={handlePhotoPress}
          onDeletePhoto={handleDeletePhoto}
          onEditPhoto={handleEditPhoto}
          lastGalleryVisit={lastGalleryVisit}
          selectedPhotos={selectedPhotos}
        />
      </View>

      {/* Editor overlay */}
      {fullscreenPhoto && <PhotoEditor photo={fullscreenPhoto} onClose={handleCloseFullscreen} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  backButton: { padding: 8 },
  backButtonWeb: { padding: 12, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  headerTitleWeb: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerActionsWeb: { gap: 8 },
  refreshButton: { padding: 8 },
  refreshButtonWeb: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  clearButton: { padding: 8 },
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
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' as any }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }),
  },
  selectionCountText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
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
  permissionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
});
