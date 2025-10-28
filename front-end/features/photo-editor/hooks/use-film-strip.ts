import { useMemo, useRef } from 'react';
import { Animated, PanResponder, PixelRatio, type PanResponderGestureState } from 'react-native';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useShallow } from 'zustand/react/shallow';

export function useFilmStrip() {
  const photos = useActiveObservationStore(useShallow(s => s.photos));
  const setActivePhoto = useActiveObservationStore(s => s.setActivePhoto);

  const STEP = 53 + 6; // photo width + spacing
  const translateX = useRef(new Animated.Value(0)).current;
  const offsetX = useRef(0);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  function finalizeDrag(g: PanResponderGestureState) {
    const total = offsetX.current + g.dx;
    const idx = clamp(Math.round(-total / STEP), 0, Math.max(0, photos.length - 1));

    const snapX = -idx * STEP;

    offsetX.current = snapX;
    translateX.flattenOffset();

    Animated.spring(translateX, {
      toValue: snapX,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();

    setActivePhoto(idx);
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
          translateX.setOffset(offsetX.current);
          translateX.setValue(0);
        },

        onPanResponderMove: (_e, g) => {
          const dx = PixelRatio.roundToNearestPixel(g.dx);
          translateX.setValue(dx);

          const total = offsetX.current + dx;
          const idx = clamp(Math.round(-total / STEP), 0, Math.max(0, photos.length - 1));
          setActivePhoto(idx);
        },

        onPanResponderRelease: (_e, g) => finalizeDrag(g),
        onPanResponderTerminate: (_e, g) => finalizeDrag(g),
      }),
    [translateX, photos.length, setActivePhoto]
  );

  return {
    photos,
    panHandlers: panResponder.panHandlers,
    translateX,
  };
}
