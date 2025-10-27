import React, { useState, useEffect } from 'react';
import { Platform, type GestureResponderEvent } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PhotoEditorProps, Shape, Tool } from '../photo-editor';
import { router } from 'expo-router';

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

type PhotoEditorPropsOptionalPhoto = Omit<PhotoEditorProps, 'photo'> & { photo: Photo | null };

export function usePhotoEditor(): PhotoEditorPropsOptionalPhoto {
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [shapes, setShape] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewShape, setPreviewShape] = useState<string>('');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    try {
      const stored = await AsyncStorage.getItem('inspecto_photos');
      if (!stored) return;

      const list: Photo[] = JSON.parse(stored);

      const valid = list.filter(p => {
        if (!p || !p.id || !p.uri || !p.timestamp) return false;

        if (Platform.OS === 'android') return p.uri.startsWith('file://');

        if (Platform.OS === 'ios')
          return (
            p.uri.startsWith('file://') ||
            p.uri.startsWith('content://') ||
            p.uri.startsWith('ph://')
          );

        if (Platform.OS === 'web')
          return (
            p.uri.startsWith('blob:') || p.uri.startsWith('file://') || p.uri.startsWith('data:')
          );

        return true;
      });

      valid.sort((a, b) => b.timestamp - a.timestamp);

      if (valid.length < list.length) {
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(valid));
      }

      setPhoto(valid[0]);
    } catch (e) {
      try {
        await AsyncStorage.removeItem('inspecto_photos');
        await AsyncStorage.removeItem('last_gallery_visit');
        await AsyncStorage.removeItem('gallery_seen_timestamp');
      } catch {}
    }
  }

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
