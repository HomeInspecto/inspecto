import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import type { CameraScreenProps } from '../camera-screen';
import IconButton from '@/components/views/icon-button/icon-button';

export default function CameraScreenView(props: CameraScreenProps) {
  const { goBack, gotoEditPhotos, photos, setCamera, flash, toggleFlash, takePhoto } = props;

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ width: '100%' }} ref={setCamera} facing="back" flash={flash} />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 70,
            paddingHorizontal: 16,
          }}
        >
          <IconButton icon="TODO-get-back-icon" onPress={goBack} />
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 50,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <IconButton size="sm" icon="TODO-add-flash-icon" onPress={toggleFlash} />
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <IconButton size="lg" icon="camera" onPress={takePhoto} />
          </View>

          <View style={{ flex: 1 }}>
            {photos.length > 0 && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  minWidth: 80,
                }}
                onPress={gotoEditPhotos}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                  Edit photo{photos.length === 1 && 's'} ({photos.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
