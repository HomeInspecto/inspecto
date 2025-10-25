import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PhotoGallery from '@/components/photo-gallery';
import PhotoEditor from '@/components/photo-editor';
import type { PhotoMarkupProps } from '../photo-markup';
import { COLORS } from '@/constants/colors';

export default function PhotoMarkupView(props: PhotoMarkupProps) {
  const {
    photos,
    loading,
    fullscreenPhoto,
    loadPhotos,
    goBack,
    handleDeletePhoto,
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
        <View>
          <IconSymbol name="photo" size={64} color="#ccc" />
          <Text>Photo Access Required</Text>
          <Text>We need access to your photos to show them in the gallery.</Text>
          <TouchableOpacity onPress={requestPermission}>
            <Text>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View>
          <Text>Loading photos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fullscreenPhoto && <PhotoEditor photo={fullscreenPhoto} onClose={goBack} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pageBackground },
});
