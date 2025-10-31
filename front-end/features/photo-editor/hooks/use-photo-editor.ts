import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PhotoEditorProps, Tool } from '../photo-editor';
import { router } from 'expo-router';
import {
  useActiveObservationStore,
  type Photo,
  type Shape,
} from '@/features/edit-observation/state';
import { useShallow } from 'zustand/shallow';
import { type GestureResponderEvent } from 'react-native';

type PhotoEditorPropsOptionalPhoto = Omit<PhotoEditorProps, 'photo'> & { photo: Photo | null };

export function usePhotoEditor(): PhotoEditorPropsOptionalPhoto {
  const [currentTool, setCurrentTool] = useState<Tool>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewShape, setPreviewShape] = useState<string>('');
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const { photos, activePhotoIndex, updatePhoto, removePhotoById, setActivePhoto } =
    useActiveObservationStore(
      useShallow(state => ({
        photos: state.photos,
        activePhotoIndex: state.activePhotoIndex,
        updatePhoto: state.updatePhoto,
        removePhotoById: state.removePhotoById,
        setActivePhoto: state.setActivePhoto,
      }))
    );

  const photo = photos[activePhotoIndex];

  function goBack() {
    router.back();
  }

  function deleteActivePhoto() {
    removePhotoById(photo.id);
  }

  useEffect(() => {
    loadExistingMarkup();
  }, []);

  function setShapes(shapes: Shape[]) {
    photo.shapes = shapes;
    updatePhoto(photo.id, photo);
  }

  function addShape(shape: Shape) {
    photo.shapes = [...(photo.shapes || []), shape];
    updatePhoto(photo.id, photo);
  }

  function undoLastShape() {
    if (!photo) return;
    photo.shapes = photo.shapes?.slice(0, -1) || [];
    updatePhoto(photo.id, photo);
  }

  const loadExistingMarkup = async () => {
    try {
      const existingMarkup = await AsyncStorage.getItem('photo_markup');
      if (existingMarkup) {
        const markupArray = JSON.parse(existingMarkup);
        const photoMarkup = markupArray.find((item: any) => item.photoId === photo?.id);
        if (photoMarkup && photoMarkup.paths) {
          setShapes(photoMarkup.paths);
        }
      }
    } catch (error) {}
  };

  type AnyEvt = GestureResponderEvent | React.MouseEvent<HTMLElement> | any;

  function getRelativePoint(event: AnyEvt): { x: number; y: number } {
    const ne = event?.nativeEvent;

    // 1) Pure React Native (iOS/Android): locationX/Y are already relative to the target
    if (ne && typeof ne.locationX === 'number' && typeof ne.locationY === 'number') {
      return { x: ne.locationX, y: ne.locationY };
    }

    // 2) Some react-native-web builds expose offsetX/offsetY on nativeEvent
    if (ne && typeof ne.offsetX === 'number' && typeof ne.offsetY === 'number') {
      return { x: ne.offsetX, y: ne.offsetY };
    }

    // 3) DOM mouse/pointer events: compute relative to bounding rect
    const target: HTMLElement | null =
      (event?.currentTarget as HTMLElement) ?? (event?.target as HTMLElement) ?? null;

    const rect = target?.getBoundingClientRect?.();
    const clientX = event?.clientX ?? ne?.clientX ?? event?.pageX ?? ne?.pageX;
    const clientY = event?.clientY ?? ne?.clientY ?? event?.pageY ?? ne?.pageY;

    if (rect && typeof clientX === 'number' && typeof clientY === 'number') {
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    return { x: 0, y: 0 };
  }

  const handleTouchStart = (event: any) => {
    const { x, y } = getRelativePoint(event);

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (currentTool === 'pen') {
      setPreviewShape(`M${x},${y}`);
    } else if (currentTool === 'circle') {
      const newShape: Shape = {
        id: Date.now().toString(),
        strokeColor: 'red',
        strokeWidth: 2,
        type: 'circle',
        cx: x,
        cy: y,
        rx: 1,
        ry: 1,
      };
      setPreviewShape(JSON.stringify(newShape));
    }
  };

  const handleTouchMove = (event: any) => {
    if (!isDrawing || !startPoint) return;

    const { x, y } = getRelativePoint(event);

    if (currentTool === 'pen') {
      setPreviewShape(prev => (prev ? `${prev} L${x},${y}` : `M${x},${y}`));
    } else if (currentTool === 'circle') {
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);

      const left = Math.min(startPoint.x, x);
      const top = Math.min(startPoint.y, y);

      const updatedOval: Shape = {
        id: Date.now().toString(),
        strokeColor: 'red',
        strokeWidth: 2,
        type: 'circle',
        // Center = corner + radius
        cx: left + width / 2,
        cy: top + height / 2,
        rx: width / 2,
        ry: height / 2,
      };

      setPreviewShape(JSON.stringify(updatedOval));
    }
  };

  const handleTouchEnd = (event: any) => {
    if (!currentTool && startPoint) {
      const { x, y } = getRelativePoint(event);

      const dx = x - startPoint.x;
      if (dx < 0 && Math.abs(dx) > 100) {
        setActivePhoto(activePhotoIndex + 1);
      }
      if (dx > 0 && Math.abs(dx) > 100) {
        setActivePhoto(activePhotoIndex - 1);
      }
      return;
    }

    if (!isDrawing || !startPoint) return;

    setIsDrawing(false);

    const { x, y } = getRelativePoint(event);

    if (currentTool === 'pen' && previewShape) {
      const newPath: Shape = {
        id: Date.now().toString(),
        d: previewShape,
        strokeColor: 'red',
        strokeWidth: 2,
        type: 'pen',
      };
      addShape(newPath);
    } else if (currentTool === 'arrow') {
      const newArrow: Shape = {
        id: Date.now().toString(),
        strokeColor: 'red',
        strokeWidth: 2,
        type: 'arrow',
        x1: startPoint.x,
        y1: startPoint.y,
        x2: x,
        y2: y,
      };
      addShape(newArrow);
    } else if (currentTool === 'circle') {
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);

      const left = Math.min(startPoint.x, x);
      const top = Math.min(startPoint.y, y);

      const updatedOval: Shape = {
        id: Date.now().toString(),
        strokeColor: 'red',
        strokeWidth: 2,
        type: 'circle',
        // Center = corner + radius
        cx: left + width / 2,
        cy: top + height / 2,
        rx: width / 2,
        ry: height / 2,
      };
      addShape(updatedOval);
    }

    setPreviewShape('');
    setStartPoint(null);
    setCurrentTool(null);
  };

  return {
    currentTool,
    photo,
    undoLastShape,
    previewShape,
    goBack,
    deleteActivePhoto,
    setCurrentTool,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
  };
}
