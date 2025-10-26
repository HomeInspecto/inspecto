import React, { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

export interface PathData {
  id: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  tool: 'pen' | 'arrow' | 'circle';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
}

export type EditorTool = 'pen' | 'arrow' | 'circle' | 'eraser' | 'hand' | 'crop';

export interface PhotoEditorProps {
  photo: Photo;
  onClose: () => void;
}

export function usePhotoEditor({ photo, onClose }: PhotoEditorProps) {
  // Screen and orientation state
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);
  
  // Editor state
  const [currentTool, setCurrentTool] = useState<EditorTool>('pen');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(3);
  const [paths, setPaths] = useState<PathData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Toolbar and selection state
  const [showExpandedToolbar, setShowExpandedToolbar] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [cropRect, setCropRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [showCropControls, setShowCropControls] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'];
  
  useEffect(() => {
    // Lock to all orientations when fullscreen opens
    ScreenOrientation.unlockAsync();
    
    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    
    // Get current orientation
    ScreenOrientation.getOrientationAsync().then(setOrientation);
    
    // Listen for orientation changes
    const orientationSubscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });
    
    // Load existing markup for this photo
    loadExistingMarkup();
    
    return () => {
      subscription?.remove();
      orientationSubscription?.remove();
      // Restore portrait lock when closing
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const loadExistingMarkup = async () => {
    try {
      const existingMarkup = await AsyncStorage.getItem('photo_markup');
      if (existingMarkup) {
        const markupArray = JSON.parse(existingMarkup);
        const photoMarkup = markupArray.find((item: any) => item.photoId === photo.id);
        if (photoMarkup && photoMarkup.paths) {
          setPaths(photoMarkup.paths);
        }
      }
    } catch (error) {
      console.error('Error loading existing markup:', error);
    }
  };
  
  const isLandscape = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                     orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  // Drawing functions
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  
  // Helper function to find object at a point
  const findObjectAtPoint = (x: number, y: number): PathData | null => {
    for (let i = paths.length - 1; i >= 0; i--) { // Check from top to bottom
      const path = paths[i];
      
      if (path.tool === 'pen' && path.d) {
        // Check if point is near the pen path
        const pathPoints = path.d.split(/[ML]/).filter(p => p.trim());
        const isNearPath = pathPoints.some(point => {
          const [px, py] = point.split(',').map(Number);
          const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
          return distance < 20; // 20px tolerance
        });
        if (isNearPath) return path;
      }
      
      if (path.tool === 'arrow') {
        // Check if point is near the arrow line
        const distance = Math.abs((path.y2! - path.y1!) * x - (path.x2! - path.x1!) * y + path.x2! * path.y1! - path.y2! * path.x1!) / 
                        Math.sqrt((path.y2! - path.y1!) ** 2 + (path.x2! - path.x1!) ** 2);
        if (distance < 20) return path;
      }
      
      if (path.tool === 'circle') {
        // Check if point is inside or near the circle/ellipse
        let distance;
        if (path.rx !== undefined && path.ry !== undefined) {
          // Ellipse
          const dx = (x - path.cx!) / path.rx;
          const dy = (y - path.cy!) / path.ry;
          distance = Math.abs(dx * dx + dy * dy - 1) * Math.min(path.rx, path.ry);
        } else {
          // Circle
          distance = Math.sqrt((x - path.cx!) ** 2 + (y - path.cy!) ** 2) - path.r!;
        }
        if (Math.abs(distance) < 20) return path;
      }
    }
    return null;
  };
  
  const handleTouchStart = (event: any) => {
    // Handle both touch and mouse events for web compatibility
    let locationX, locationY;
    
    if (event.nativeEvent) {
      // Mobile touch events
      locationX = event.nativeEvent.locationX || event.nativeEvent.clientX;
      locationY = event.nativeEvent.locationY || event.nativeEvent.clientY;
    } else {
      // Web mouse events
      locationX = event.clientX;
      locationY = event.clientY;
    }
    
    // Handle hand tool for object selection and movement
    if (currentTool === 'hand') {
      // Find the object at the touch point
      const touchedObject = findObjectAtPoint(locationX, locationY);
      if (touchedObject) {
        setSelectedObjectId(touchedObject.id);
        setIsDraggingObject(true);
        setStartPoint({ x: locationX, y: locationY });
      } else {
        setSelectedObjectId(null);
      }
      return;
    }
    
    // Handle crop tool
    if (currentTool === 'crop') {
      if (!cropRect) {
        // Start new crop rectangle
        setCropRect({ x: locationX, y: locationY, width: 0, height: 0 });
        setStartPoint({ x: locationX, y: locationY });
      }
      return;
    }
    
    if (currentTool === 'eraser') {
      // Handle eraser - remove paths that are touched
      const eraserRadius = 30; // Larger eraser radius
      
      const newPaths = paths.filter(path => {
        // Check distance for pen paths
        if (path.tool === 'pen' && path.d) {
          const pathPoints = path.d.split(/[ML]/).filter(p => p.trim());
          const isTouched = pathPoints.some(point => {
            const [x, y] = point.split(',').map(Number);
            const distance = Math.sqrt((x - locationX) ** 2 + (y - locationY) ** 2);
            return distance < eraserRadius;
          });
          return !isTouched; // Keep if not touched
        }
        
        // Check distance for arrow paths
        if (path.tool === 'arrow') {
          const distance1 = Math.sqrt((path.x1! - locationX) ** 2 + (path.y1! - locationY) ** 2);
          const distance2 = Math.sqrt((path.x2! - locationX) ** 2 + (path.y2! - locationY) ** 2);
          const isTouched = distance1 < eraserRadius || distance2 < eraserRadius;
          return !isTouched; // Keep if not touched
        }
        
        // Check distance for circle paths
        if (path.tool === 'circle') {
          const distance = Math.sqrt((path.cx! - locationX) ** 2 + (path.cy! - locationY) ** 2);
          const isTouched = distance < (path.r! + eraserRadius);
          return !isTouched; // Keep if not touched
        }
        
        return true; // Keep other paths
      });
      
      setPaths(newPaths);
      return;
    }
    
    setIsDrawing(true);
    setStartPoint({ x: locationX, y: locationY });
    
    if (currentTool === 'pen') {
      const newPath = `M${locationX},${locationY}`;
      setCurrentPath(newPath);
    } else if (currentTool === 'circle') {
      // For circle tool, start with a small oval that will be stretched
      const newPath: PathData = {
        id: Date.now().toString(),
        d: '',
        stroke: currentColor,
        strokeWidth: brushSize,
        tool: 'circle',
        cx: locationX,
        cy: locationY,
        r: 1, // Start with minimal radius
        rx: 1, // Add rx and ry for oval support
        ry: 1
      };
      setCurrentPath(JSON.stringify(newPath));
    }
  };

  const handleTouchMove = (event: any) => {
    // Handle both touch and mouse events for web compatibility
    let locationX, locationY;
    
    if (event.nativeEvent) {
      // Mobile touch events
      locationX = event.nativeEvent.locationX || event.nativeEvent.clientX;
      locationY = event.nativeEvent.locationY || event.nativeEvent.clientY;
    } else {
      // Web mouse events
      locationX = event.clientX;
      locationY = event.clientY;
    }
    
    // Handle hand tool for object dragging
    if (currentTool === 'hand' && isDraggingObject && selectedObjectId && startPoint) {
      const deltaX = locationX - startPoint.x;
      const deltaY = locationY - startPoint.y;
      
      // Update the selected object's position
      setPaths(prevPaths => 
        prevPaths.map(path => {
          if (path.id === selectedObjectId) {
            const updatedPath = { ...path };
            
            if (path.tool === 'pen' && path.d) {
              // Move all points in the pen path
              const pathPoints = path.d.split(/[ML]/).filter(p => p.trim());
              const movedPoints = pathPoints.map(point => {
                const [px, py] = point.split(',').map(Number);
                return `${px + deltaX},${py + deltaY}`;
              });
              updatedPath.d = `M${movedPoints[0]} L${movedPoints.slice(1).join(' L')}`;
            } else if (path.tool === 'arrow') {
              updatedPath.x1 = path.x1! + deltaX;
              updatedPath.y1 = path.y1! + deltaY;
              updatedPath.x2 = path.x2! + deltaX;
              updatedPath.y2 = path.y2! + deltaY;
            } else if (path.tool === 'circle') {
              updatedPath.cx = path.cx! + deltaX;
              updatedPath.cy = path.cy! + deltaY;
            }
            
            return updatedPath;
          }
          return path;
        })
      );
      
      setStartPoint({ x: locationX, y: locationY });
      return;
    }
    
    // Handle crop tool for rectangle resizing
    if (currentTool === 'crop' && cropRect && startPoint) {
      const newWidth = Math.abs(locationX - startPoint.x);
      const newHeight = Math.abs(locationY - startPoint.y);
      const newX = Math.min(startPoint.x, locationX);
      const newY = Math.min(startPoint.y, locationY);
      
      setCropRect({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
      return;
    }
    
    if (currentTool === 'eraser') {
      // Handle eraser while dragging
      const eraserRadius = 30;
      
      const newPaths = paths.filter(path => {
        // Check distance for pen paths
        if (path.tool === 'pen' && path.d) {
          const pathPoints = path.d.split(/[ML]/).filter(p => p.trim());
          const isTouched = pathPoints.some(point => {
            const [x, y] = point.split(',').map(Number);
            const distance = Math.sqrt((x - locationX) ** 2 + (y - locationY) ** 2);
            return distance < eraserRadius;
          });
          return !isTouched;
        }
        
        // Check distance for arrow paths
        if (path.tool === 'arrow') {
          const distance1 = Math.sqrt((path.x1! - locationX) ** 2 + (path.y1! - locationY) ** 2);
          const distance2 = Math.sqrt((path.x2! - locationX) ** 2 + (path.y2! - locationY) ** 2);
          const isTouched = distance1 < eraserRadius || distance2 < eraserRadius;
          return !isTouched;
        }
        
        // Check distance for circle paths
        if (path.tool === 'circle') {
          const distance = Math.sqrt((path.cx! - locationX) ** 2 + (path.cy! - locationY) ** 2);
          const isTouched = distance < (path.r! + eraserRadius);
          return !isTouched;
        }
        
        return true;
      });
      
      setPaths(newPaths);
      return;
    }
    
    if (!isDrawing || !startPoint) return;
    
    if (currentTool === 'pen') {
      const updatedPath = `${currentPath} L${locationX},${locationY}`;
      setCurrentPath(updatedPath);
    } else if (currentTool === 'circle') {
      // Update the current oval in real-time
      const deltaX = Math.abs(locationX - startPoint.x);
      const deltaY = Math.abs(locationY - startPoint.y);
      
      const updatedOval: PathData = {
        id: Date.now().toString(),
        d: '',
        stroke: currentColor,
        strokeWidth: brushSize,
        tool: 'circle',
        cx: startPoint.x,
        cy: startPoint.y,
        r: Math.sqrt(deltaX * deltaX + deltaY * deltaY), // Keep r for compatibility
        rx: deltaX, // Horizontal radius
        ry: deltaY  // Vertical radius
      };
      setCurrentPath(JSON.stringify(updatedOval));
    }
  };

  const handleTouchEnd = (event: any) => {
    // Handle both touch and mouse events for web compatibility
    let locationX, locationY;
    
    if (event.nativeEvent) {
      // Mobile touch events
      locationX = event.nativeEvent.locationX || event.nativeEvent.clientX;
      locationY = event.nativeEvent.locationY || event.nativeEvent.clientY;
    } else {
      // Web mouse events
      locationX = event.clientX;
      locationY = event.clientY;
    }
    
    // Handle hand tool - finalize object movement
    if (currentTool === 'hand') {
      setIsDraggingObject(false);
      setStartPoint(null);
      return;
    }
    
    // Handle crop tool - finalize crop rectangle and show controls
    if (currentTool === 'crop') {
      setStartPoint(null);
      if (cropRect && cropRect.width > 10 && cropRect.height > 10) {
        setShowCropControls(true);
      }
      return;
    }
    
    if (!isDrawing || !startPoint) return;
    
    setIsDrawing(false);
    
    if (currentTool === 'pen' && currentPath) {
      const newPath: PathData = {
        id: Date.now().toString(),
        d: currentPath,
        stroke: currentColor,
        strokeWidth: brushSize,
        tool: 'pen'
      };
      setPaths([...paths, newPath]);
    } else if (currentTool === 'arrow') {
      const newPath: PathData = {
        id: Date.now().toString(),
        d: '',
        stroke: currentColor,
        strokeWidth: brushSize,
        tool: 'arrow',
        x1: startPoint.x,
        y1: startPoint.y,
        x2: locationX,
        y2: locationY
      };
      setPaths([...paths, newPath]);
    } else if (currentTool === 'circle') {
      // Finalize the oval with the final dimensions
      const deltaX = Math.abs(locationX - startPoint.x);
      const deltaY = Math.abs(locationY - startPoint.y);
      
      const newPath: PathData = {
        id: Date.now().toString(),
        d: '',
        stroke: currentColor,
        strokeWidth: brushSize,
        tool: 'circle',
        cx: startPoint.x,
        cy: startPoint.y,
        r: Math.sqrt(deltaX * deltaX + deltaY * deltaY), // Keep r for compatibility
        rx: deltaX, // Horizontal radius
        ry: deltaY  // Vertical radius
      };
      setPaths([...paths, newPath]);
    }
    
    setCurrentPath('');
    setStartPoint(null);
  };

  const clearAll = () => {
    setPaths([]);
  };

  const handleClose = () => {
    if (paths.length > 0) {
      setShowSaveModal(true);
    } else {
      onClose();
    }
  };

  const handleSaveChanges = async () => {
    try {
      // For now, we'll save the markup data to AsyncStorage
      // In a real implementation, you'd want to use a library like react-native-view-shot
      // to capture the combined image + SVG as a single image
      
      const markupData = {
        photoId: photo.id,
        paths: paths,
        timestamp: Date.now()
      };
      
      // Get existing markup data
      const existingMarkup = await AsyncStorage.getItem('photo_markup');
      let markupArray = existingMarkup ? JSON.parse(existingMarkup) : [];
      
      // Update or add markup for this photo
      const existingIndex = markupArray.findIndex((item: any) => item.photoId === photo.id);
      if (existingIndex >= 0) {
        markupArray[existingIndex] = markupData;
      } else {
        markupArray.push(markupData);
      }
      
      // Save updated markup data
      await AsyncStorage.setItem('photo_markup', JSON.stringify(markupArray));
      
      console.log('Markup saved for photo:', photo.id);
      
      setShowSaveModal(false);
      onClose();
      
    } catch (error) {
      console.error('Error saving markup data:', error);
      setShowSaveModal(false);
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowSaveModal(false);
    onClose();
  };
  
  const handleCropConfirm = async () => {
    if (!cropRect) return;
    
    try {
      setIsCropping(true);
      
      // For now, we'll simulate cropping by showing a success message
      // In a real implementation, you'd use a library like react-native-image-crop-picker
      // or implement server-side cropping
      
      console.log('Crop area:', cropRect);
      
      // Update the photo URI in AsyncStorage with a note that it's been cropped
      const storedPhotos = await AsyncStorage.getItem('inspecto_photos');
      if (storedPhotos) {
        const photoList = JSON.parse(storedPhotos);
        const updatedPhotos = photoList.map((p: Photo) => 
          p.id === photo.id ? { 
            ...p, 
            uri: p.uri, // Keep original URI for now
            cropped: true,
            cropRect: cropRect // Store crop info for future use
          } : p
        );
        await AsyncStorage.setItem('inspecto_photos', JSON.stringify(updatedPhotos));
      }
      
      // Clear crop state
      setCropRect(null);
      setShowCropControls(false);
      setCurrentTool('pen'); // Switch back to pen tool
      setIsCropping(false);
      
      // Show success message
      alert('Image crop area saved! (Note: Full cropping implementation requires additional image processing library)');
      
      // Close the editor to show the result
      onClose();
      
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsCropping(false);
    }
  };
  
  const handleCropCancel = () => {
    setCropRect(null);
    setShowCropControls(false);
    setCurrentTool('pen');
  };

  return {
    // State
    screenDimensions,
    orientation,
    currentTool,
    currentColor,
    brushSize,
    paths,
    isDrawing,
    currentPath,
    showColorPicker,
    showSaveModal,
    showExpandedToolbar,
    selectedObjectId,
    isDraggingObject,
    cropRect,
    showCropControls,
    isCropping,
    colors,
    isLandscape,
    startPoint,
    
    // Actions
    setCurrentTool,
    setCurrentColor,
    setBrushSize,
    setPaths,
    setIsDrawing,
    setCurrentPath,
    setShowColorPicker,
    setShowSaveModal,
    setShowExpandedToolbar,
    setSelectedObjectId,
    setIsDraggingObject,
    setCropRect,
    setShowCropControls,
    setIsCropping,
    setStartPoint,
    
    // Functions
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearAll,
    handleClose,
    handleSaveChanges,
    handleDiscardChanges,
    handleCropConfirm,
    handleCropCancel,
    findObjectAtPoint,
  };
}
