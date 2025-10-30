import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/views/icon/icon';
import type { PhotoManagerProps } from '../photo-manager';
import { COLORS } from '@/constants/colors';

export default function PhotoManagerView(props: PhotoManagerProps) {
  // Extract props
  const {
    fullscreenPhoto,
    goBack,
    permissionsLoading,
    permissionGranted,
    requestPermission,
    shouldCheckPermissions,
  } = props;

  // Show loading while checking permissions
  if (permissionsLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading permissions...</Text>
      </View>
    );
  }

  // Show permission request if needed
  if (!permissionGranted && shouldCheckPermissions) {
    return (
      <View style={styles.container}>
        <View>
          <Icon name="photo" size={64} color="#ccc" />
          <Text>Photo Access Required</Text>
          <Text>We need access to your photos to show them in the gallery.</Text>
          <TouchableOpacity onPress={requestPermission}>
            <Text>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pageBackground },
});
