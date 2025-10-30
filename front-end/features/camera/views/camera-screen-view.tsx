import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import type { CameraScreenProps } from '../camera-screen';
import IconButton from '@/components/views/icon-button/icon-button';
import Button from '@/components/views/button/button';

export default function CameraScreenView(props: CameraScreenProps) {
  const { goBack, gotoEditPhotos, photos, setCamera, flash, toggleFlash, takePhoto } = props;

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={StyleSheet.absoluteFill} ref={setCamera} facing="back" flash={flash} />
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
              <Button
                color="secondary"
                text={`Edit photo${photos.length === 1 ? '' : 's'} (${photos.length})`}
                onPress={gotoEditPhotos}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
