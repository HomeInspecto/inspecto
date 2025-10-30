import type { Photo } from '@/features/edit-observation/state';
import { Image } from 'expo-image';
import { Animated, View } from 'react-native';

const AnimatedImage = Animated.createAnimatedComponent(Image);

export interface FilmStripViewProps {
  photos: Photo[];
  translateX: Animated.Value;
  panHandlers: any;
  activeIndex: number;
  isDragging: Animated.Value; // 0 idle, 1 dragging (from the hook)
}

export function FilmStripView({
  photos,
  translateX,
  panHandlers,
  activeIndex,
  isDragging,
}: FilmStripViewProps) {
  if (!photos.length) return null;

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
          {photos.map((photo, i) => {
            const isActive = i === activeIndex;
            return (
              <Animated.View
                key={photo.id}
                style={{
                  userSelect: 'none',
                  pointerEvents: 'none',
                  alignItems: 'center',
                  marginHorizontal: 3,
                }}
              >
                <AnimatedImage
                  style={{
                    height: 70, // keep a consistent height
                    width: 53,
                    borderRadius: 6,
                    transform: [{ translateX: '-50%' }],
                  }}
                  source={{ uri: photo.uri }}
                  contentFit="cover"
                />
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
}
