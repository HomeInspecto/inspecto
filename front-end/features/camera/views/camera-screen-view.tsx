import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRef } from 'react';
import IconButton from '@/components/views/icon-button/icon-button';
import Button from '@/components/views/button/button';
import Text from '@/components/views/text/text';
import type { CameraScreenProps } from '../camera-screen';
import { COLORS } from '@/constants/colors';

export default function CameraScreenView(props: CameraScreenProps) {
  const { goBack, gotoEditPhotos, photos, cameraRef, torch, toggleTorch, takePhoto, zoom, setZoom, currentZoomLabel, zoomLevels, getZoomValue } = props;

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
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <Animated.View style={{ flex: 1, opacity }}>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back" enableTorch={torch} zoom={zoom} />
        </Animated.View>
      </View>

      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', }}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <View
            style={{ position: 'absolute', top: 0, bottom: 0, left: '33.33%', width: 1, backgroundColor: COLORS.label.onDark.primary, opacity: 0.1, }}
          />
          <View
            style={{ position: 'absolute', top: 0, bottom: 0, left: '66.66%', width: 1, backgroundColor: COLORS.label.onDark.primary, opacity: 0.1, }}
          />
          <View
            style={{ position: 'absolute', left: 0, right: 0, top: '33.33%', height: 1, backgroundColor: COLORS.label.onDark.primary, opacity: 0.1, }}
          />
          <View
            style={{ position: 'absolute', left: 0, right: 0, top: '66.66%', height: 1, backgroundColor: COLORS.label.onDark.primary, opacity: 0.1, }}
          />
        </View>

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 80, }}
        >
          <IconButton icon="chevron.left" onPress={goBack} />
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 120,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <IconButton size="sm" icon="bolt.fill" onPress={toggleTorch} color={torch ? 'secondary' : 'primary'} />
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: COLORS.material.secondary.fill,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: 'row',
                gap: 20,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              {zoomLevels.map((level) => {
                const isActive = currentZoomLabel === level;
                const displayText = isActive ? level : level.replace('x', '');
                return (
                  <Pressable
                    key={level}
                    onPress={() => setZoom(getZoomValue(level))}
                    style={{ paddingHorizontal: 4.5, paddingVertical: 2, minWidth: 14, alignItems: 'center', }}
                  >
                    <Text
                      variant="callout"
                      weight={isActive ? 'emphasized' : 'regular'}
                      style={{
                        color: isActive ? COLORS.label.onDark.primary : COLORS.label.onDark.tertiary,
                      }}
                    >
                      {displayText}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <IconButton size="lg" icon="camera.fill" onPress={handleTakePhoto} />
          </View>

          <View style={{ flex: 1 }}>
            {photos.length > 0 && ( 
              <Button color="secondary" text={`Edit (${photos.length})`} onPress={gotoEditPhotos} /> 
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
