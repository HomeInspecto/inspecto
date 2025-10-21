import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, StatusBar, Text } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ScreenOrientation from 'expo-screen-orientation';
import Svg, { Path, Line, Circle, G } from 'react-native-svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

interface PhotoEditorProps {
  photo: Photo;
  onClose: () => void;
}

interface PathData {
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
}

type EditorTool = 'pen' | 'arrow' | 'circle' | 'eraser';

export default function PhotoEditor({ photo, onClose }: PhotoEditorProps) {
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
    
    if (!isDrawing || currentTool === 'arrow' || currentTool === 'circle') return;
    
    const updatedPath = `${currentPath} L${locationX},${locationY}`;
    setCurrentPath(updatedPath);
  };

  const handleTouchEnd = (event: any) => {
    if (!isDrawing || !startPoint) return;
    
    setIsDrawing(false);
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
      const radius = Math.sqrt((locationX - startPoint.x) ** 2 + (locationY - startPoint.y) ** 2);
      const newPath: PathData = {
        id: Date.now().toString(),
        d: '',
        stroke: currentColor,
        strokeWidth: brushSize,
        tool: 'circle',
        cx: startPoint.x,
        cy: startPoint.y,
        r: radius
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
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.container}>
        <Image 
          source={{ uri: photo.uri }} 
          style={[
            styles.image, 
            { 
              width: screenDimensions.width, 
              height: screenDimensions.height 
            }
          ]}
          contentFit="contain"
          onError={(error) => {
            console.error('Error loading fullscreen image:', error);
          }}
        />
        
        {/* SVG Overlay for markup */}
        <View 
          style={styles.svgOverlay}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          {...(Platform.OS === 'web' && {
            onMouseDown: handleTouchStart,
            onMouseMove: handleTouchMove,
            onMouseUp: handleTouchEnd,
          })}
        >
          <Svg
            width={screenDimensions.width}
            height={screenDimensions.height}
          >
            {paths.map((path) => {
              if (path.tool === 'pen') {
                return (
                  <Path
                    key={path.id}
                    d={path.d}
                    stroke={path.stroke}
                    strokeWidth={path.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              } else if (path.tool === 'arrow') {
                // Calculate arrow head points for both sides
                const angle = Math.atan2(path.y2! - path.y1!, path.x2! - path.x1!);
                const arrowLength = 15;
                const arrowAngle = Math.PI / 6; // 30 degrees
                
                const arrowX1 = path.x2! - arrowLength * Math.cos(angle - arrowAngle);
                const arrowY1 = path.y2! - arrowLength * Math.sin(angle - arrowAngle);
                const arrowX2 = path.x2! - arrowLength * Math.cos(angle + arrowAngle);
                const arrowY2 = path.y2! - arrowLength * Math.sin(angle + arrowAngle);
                
                return (
                  <G key={path.id}>
                    <Line
                      x1={path.x1}
                      y1={path.y1}
                      x2={path.x2}
                      y2={path.y2}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={path.x2}
                      y1={path.y2}
                      x2={arrowX1}
                      y2={arrowY1}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={path.x2}
                      y1={path.y2}
                      x2={arrowX2}
                      y2={arrowY2}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      strokeLinecap="round"
                    />
                  </G>
                );
              } else if (path.tool === 'circle') {
                return (
                  <Circle
                    key={path.id}
                    cx={path.cx}
                    cy={path.cy}
                    r={path.r}
                    stroke={path.stroke}
                    strokeWidth={path.strokeWidth}
                    fill="none"
                  />
                );
              }
              return null;
            })}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentColor}
                strokeWidth={brushSize}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>
        
        {/* Toolbar */}
        <View style={[styles.toolbar, isLandscape && styles.toolbarLandscape]}>
          <TouchableOpacity 
            style={[styles.toolButton, currentTool === 'pen' && styles.activeTool]}
            onPress={() => setCurrentTool('pen')}
          >
            <IconSymbol name="pencil" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toolButton, currentTool === 'arrow' && styles.activeTool]}
            onPress={() => setCurrentTool('arrow')}
          >
            <IconSymbol name="arrow.right" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toolButton, currentTool === 'circle' && styles.activeTool]}
            onPress={() => setCurrentTool('circle')}
          >
            <IconSymbol name="circle" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toolButton, showColorPicker && styles.activeTool]}
            onPress={() => setShowColorPicker(!showColorPicker)}
          >
            <View style={[styles.colorIndicator, { backgroundColor: currentColor }]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toolButton, currentTool === 'eraser' && styles.activeTool]}
            onPress={() => setCurrentTool('eraser')}
          >
            <IconSymbol name="eraser" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={clearAll}
          >
            <IconSymbol name="trash" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={handleClose}
          >
            <IconSymbol name="xmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Inline Color Picker */}
        {showColorPicker && (
          <View style={[styles.inlineColorPicker, isLandscape && styles.inlineColorPickerLandscape]}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor
                ]}
                onPress={() => {
                  setCurrentColor(color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </View>
        )}
        
        {/* Save Confirmation Modal */}
        {showSaveModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <IconSymbol name="photo" size={32} color="#007AFF" />
                <Text style={styles.modalTitle}>Save Changes?</Text>
              </View>
              
              <Text style={styles.modalMessage}>
                Do you want to save your changes to this photo?
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.discardButton]}
                  onPress={handleDiscardChanges}
                >
                  <Text style={styles.discardButtonText}>Discard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  image: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  closeButtonLandscape: {
    top: Platform.OS === 'ios' ? 30 : 20,
    right: 30,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  toolbar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  toolbarLandscape: {
    top: '50%',
    right: 20,
    left: 'auto',
    width: 50,
    height: 'auto',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -120 }],
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 2,
    marginVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTool: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  inlineColorPicker: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  inlineColorPickerLandscape: {
    top: '50%',
    right: 80,
    left: 'auto',
    width: 50,
    height: 'auto',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -120 }],
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 2,
    marginVertical: 1,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderColor: 'white',
    borderWidth: 3,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
    maxWidth: 320,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 25,
      elevation: 25,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  discardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
