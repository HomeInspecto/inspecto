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

  const idleActiveWidth = 70;
  const normalWidth = 53;

  const idleActiveMargin = 13;
  const normalMargin = 3;

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
          marginRight: idleActiveWidth + idleActiveMargin,
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

            // When idle (isDragging=0) we want 70; when dragging (isDragging=1) we want 53
            const animatedWidth = isActive
              ? isDragging.interpolate({
                  inputRange: [0, 1],
                  outputRange: [idleActiveWidth, normalWidth],
                  extrapolate: 'clamp',
                })
              : normalWidth;

            const animatedMargin = isActive
              ? isDragging.interpolate({
                  inputRange: [0, 1],
                  outputRange: [idleActiveMargin, normalMargin],
                  extrapolate: 'clamp',
                })
              : normalMargin;

            return (
              <Animated.View
                key={photo.id}
                style={{
                  userSelect: 'none',
                  pointerEvents: 'none',
                  paddingHorizontal: animatedMargin as any,
                }}
              >
                <AnimatedImage
                  style={{
                    height: idleActiveWidth, // keep a consistent height
                    width: animatedWidth as any,
                    borderRadius: 6,
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
