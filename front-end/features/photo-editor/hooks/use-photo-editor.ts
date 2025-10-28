import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PhotoEditorProps, Tool } from '../photo-editor';
import { router } from 'expo-router';
import {
  useActiveObservationStore,
  type Photo,
  type Shape,
} from '@/features/edit-observation/state';
import { useShallow } from 'zustand/shallow';

type PhotoEditorPropsOptionalPhoto = Omit<PhotoEditorProps, 'photo'> & { photo: Photo | null };

export function usePhotoEditor(): PhotoEditorPropsOptionalPhoto {
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [shapes, setShape] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewShape, setPreviewShape] = useState<string>('');
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const { photos, activePhotoIndex } = useActiveObservationStore(
    useShallow(state => ({
      photos: state.photos,
      activePhotoIndex: state.activePhotoIndex,
    }))
  );

  const photo = photos[activePhotoIndex];

  function goBack() {
    router.back();
  }
  function deleteActivePhoto() {}

  useEffect(() => {
    loadExistingMarkup();
  }, []);

  const loadExistingMarkup = async () => {
    try {
      const existingMarkup = await AsyncStorage.getItem('photo_markup');
      if (existingMarkup) {
        const markupArray = JSON.parse(existingMarkup);
        const photoMarkup = markupArray.find((item: any) => item.photoId === photo?.id);
        if (photoMarkup && photoMarkup.paths) {
          setShape(photoMarkup.paths);
        }
      }
    } catch (error) {}
  };

  function getRelativePoint(event: any): { x: number; y: number } {
    // if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // TODO figure out for ios/androd
    // return {
    //   x: event.nativeEvent.locationX,
    //   y: event.nativeEvent.locationY,
    // };

    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    return {
      x: (event as MouseEvent).clientX - rect.left,
      y: (event as MouseEvent).clientY - rect.top,
    };
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
      const deltaX = Math.abs(x - startPoint.x);
      const deltaY = Math.abs(y - startPoint.y);

      const updatedOval: Shape = {
        id: Date.now().toString(),
        strokeColor: 'red',
        strokeWidth: 2,
        type: 'circle',
        cx: startPoint.x,
        cy: startPoint.y,
        rx: deltaX,
        ry: deltaY,
      };
      setPreviewShape(JSON.stringify(updatedOval));
    }
  };

  const handleTouchEnd = (event: any) => {
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
      setShape(prev => [...prev, newPath]);
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
      setShape(prev => [...prev, newArrow]);
    } else if (currentTool === 'circle') {
      const deltaX = Math.abs(x - startPoint.x);
      const deltaY = Math.abs(y - startPoint.y);

      const newCircle: Shape = {
        id: Date.now().toString(),
        strokeColor: 'red',
        strokeWidth: 2,
        type: 'circle',
        cx: startPoint.x,
        cy: startPoint.y,
        rx: deltaX,
        ry: deltaY,
      };
      setShape(prev => [...prev, newCircle]);
    }

    setPreviewShape('');
    setStartPoint(null);
    handleSaveChanges();
  };

  // Clear all drawings from the photo
  const clearMarkup = () => {
    setShape([]);
  };

  const handleSaveChanges = async () => {
    if (!photo) return;
    try {
      const markupData = {
        photoId: photo.id,
        shapes: shapes,
        timestamp: Date.now(),
      };

      const existingMarkup = await AsyncStorage.getItem('photo_markup');
      let markupArray = existingMarkup ? JSON.parse(existingMarkup) : [];

      const existingIndex = markupArray.findIndex((item: any) => item.photoId === photo?.id);
      if (existingIndex >= 0) {
        markupArray[existingIndex] = markupData;
      } else {
        markupArray.push(markupData);
      }

      await AsyncStorage.setItem('photo_markup', JSON.stringify(markupArray));
    } catch (error) {}
  };

  return {
    shapes,
    currentTool,
    photo,
    clearMarkup,
    previewShape,
    goBack,
    deleteActivePhoto,
    setCurrentTool,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
  };
}
