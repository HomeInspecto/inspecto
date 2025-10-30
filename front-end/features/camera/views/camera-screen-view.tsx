import { View, StyleSheet, Animated } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRef } from 'react';
import IconButton from '@/components/views/icon-button/icon-button';
import Button from '@/components/views/button/button';
import type { CameraScreenProps } from '../camera-screen';
import { COLORS } from '@/constants/colors';

export default function CameraScreenView(props: CameraScreenProps) {
  const { goBack, gotoEditPhotos, photos, cameraRef, flash, toggleFlash, takePhoto } = props;

  const opacity = useRef(new Animated.Value(1)).current;

  const handleTakePhoto = async () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    takePhoto();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.pageBackground }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
          <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" flash={flash} />
        </Animated.View>
      </View>

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
          <IconButton icon="chevron.left" onPress={goBack} />
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
            <IconButton size="sm" icon="bolt" onPress={toggleFlash} />
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <IconButton size="lg" icon="camera" onPress={handleTakePhoto} />
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
