import type { Photo } from '@/features/edit-observation/state';
import { Image } from 'expo-image';
import { Animated, View } from 'react-native';

export interface FilmStripViewProps {
  photos: Photo[];
  translateX: Animated.Value;
  panHandlers: any;
}

export function FilmStripView({ photos, translateX, panHandlers }: FilmStripViewProps) {
  if (!photos.length) return null;

  const activeWidth = 70;
  const width = 53;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          transform: [{ translateX: '50%' }],
        }}
      >
        <Animated.View
          {...panHandlers}
          style={{
            width: '100%',
            flexDirection: 'row',
            position: 'relative',
            transform: [{ translateX }],
          }}
        >
          {photos.map((photo, i) => (
            <View style={{ userSelect: 'none' }}>
              <Image
                pointerEvents="none"
                key={photo.id}
                style={{
                  height: activeWidth,
                  width: false ? activeWidth : width,
                  marginHorizontal: false ? 10 : 3,
                  borderRadius: 6,
                  transform: [{ translateX: '-50%' }],
                }}
                source={{ uri: photo.uri }}
                contentFit="cover"
              />
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
