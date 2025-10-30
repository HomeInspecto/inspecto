import { useMemo, useRef } from 'react';
import { Animated, PanResponder, PixelRatio, type PanResponderGestureState } from 'react-native';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useShallow } from 'zustand/react/shallow';

export function useFilmStrip() {
  const { photos, setActivePhoto, activePhotoIndex } = useActiveObservationStore(
    useShallow(s => ({
      photos: s.photos,
      setActivePhoto: s.setActivePhoto,
      activePhotoIndex: s.activePhotoIndex, // <-- assuming your store exposes this index
    }))
  );

  const STEP = 53 + 6; // photo width + spacing
  const translateX = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(new Animated.Value(0)).current; // 0 = idle, 1 = dragging
  const offsetX = useRef(0);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const setTranslateX = (idx: number) => {
    const snapX = -idx * STEP;

    offsetX.current = snapX;
    translateX.flattenOffset();

    Animated.spring(translateX, {
      toValue: snapX,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  function finalizeDrag(g: PanResponderGestureState) {
    const total = offsetX.current + g.dx;
    const idx = clamp(Math.round(-total / STEP), 0, Math.max(0, photos.length - 1));

    setTranslateX(idx);
    setActivePhoto(idx);

    Animated.timing(isDragging, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          translateX.setOffset(offsetX.current);
          translateX.setValue(0);

          Animated.timing(isDragging, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }).start();
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
    activeIndex: activePhotoIndex ?? 0, // fallback if store isn’t set yet
    panHandlers: panResponder.panHandlers,
    translateX,
    isDragging,
  };
}
