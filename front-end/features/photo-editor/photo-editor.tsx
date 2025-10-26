import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, StatusBar, Text } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ScreenOrientation from 'expo-screen-orientation';
import Svg, { Path, Line, Circle, G, Ellipse } from 'react-native-svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePhotoEditor } from './hooks/use-photo-editor';
import type { PhotoEditorProps } from './hooks/use-photo-editor';

export default function PhotoEditor({ photo, onClose }: PhotoEditorProps) {
  const {
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
  } = usePhotoEditor({ photo, onClose });

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
        
        {/* Crop Rectangle Overlay */}
        {cropRect && (
          <View 
            style={[
              styles.cropOverlay,
              {
                left: cropRect.x,
                top: cropRect.y,
                width: cropRect.width,
                height: cropRect.height,
              }
            ]}
          />
        )}
        
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
              const isSelected = selectedObjectId === path.id;
              const strokeColor = isSelected ? '#007AFF' : path.stroke;
              const strokeWidth = isSelected ? path.strokeWidth + 2 : path.strokeWidth;
              
              if (path.tool === 'pen') {
                return (
                  <Path
                    key={path.id}
                    d={path.d}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
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
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={path.x2}
                      y1={path.y2}
                      x2={arrowX1}
                      y2={arrowY1}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={path.x2}
                      y1={path.y2}
                      x2={arrowX2}
                      y2={arrowY2}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                    />
                  </G>
                );
              } else if (path.tool === 'circle') {
                // Use ellipse for oval support, fallback to circle if rx/ry not available
                if (path.rx !== undefined && path.ry !== undefined) {
                  return (
                    <Ellipse
                      key={path.id}
                      cx={path.cx}
                      cy={path.cy}
                      rx={path.rx}
                      ry={path.ry}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                  );
                } else {
                  return (
                    <Circle
                      key={path.id}
                      cx={path.cx}
                      cy={path.cy}
                      r={path.r}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                  );
                }
              }
              return null;
            })}
            {currentPath && (
              <>
                {currentTool === 'pen' && (
                  <Path
                    d={currentPath}
                    stroke={currentColor}
                    strokeWidth={brushSize}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {currentTool === 'circle' && (() => {
                  try {
                    const pathData = JSON.parse(currentPath);
                    if (pathData.rx !== undefined && pathData.ry !== undefined) {
                      return (
                        <Ellipse
                          cx={pathData.cx}
                          cy={pathData.cy}
                          rx={pathData.rx}
                          ry={pathData.ry}
                          stroke={currentColor}
                          strokeWidth={brushSize}
                          fill="none"
                        />
                      );
                    }
                  } catch (e) {
                    // Fallback to path rendering if JSON parsing fails
                  }
                  return null;
                })()}
              </>
            )}
          </Svg>
        </View>
        
        {/* Toolbar */}
        <View style={[styles.toolbar, isLandscape && styles.toolbarLandscape]}>
          {/* Always visible tools */}
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
            style={[styles.toolButton, currentTool === 'eraser' && styles.activeTool]}
            onPress={() => setCurrentTool('eraser')}
          >
            <IconSymbol name="eraser" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toolButton, showColorPicker && styles.activeTool]}
            onPress={() => {
              setShowColorPicker(!showColorPicker);
              setShowExpandedToolbar(false); // Close expanded toolbar when opening color picker
            }}
          >
            <View style={[styles.colorIndicator, { backgroundColor: currentColor }]} />
          </TouchableOpacity>
          
          {/* More button */}
          <TouchableOpacity 
            style={[styles.toolButton, showExpandedToolbar && styles.activeTool]}
            onPress={() => {
              setShowExpandedToolbar(!showExpandedToolbar);
              setShowColorPicker(false); // Close color picker when opening expanded toolbar
            }}
          >
            <IconSymbol name="ellipsis" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={handleClose}
          >
            <IconSymbol name="xmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Expanded toolbar */}
        {showExpandedToolbar && (
          <View style={[styles.expandedToolbar, isLandscape && styles.expandedToolbarLandscape]}>
            <TouchableOpacity 
              style={[styles.toolButton, currentTool === 'hand' && styles.activeTool]}
              onPress={() => {
                setCurrentTool('hand');
                setShowExpandedToolbar(false);
              }}
            >
              <IconSymbol name="hand.raised" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.toolButton, currentTool === 'crop' && styles.activeTool]}
              onPress={() => {
                setCurrentTool('crop');
                setShowExpandedToolbar(false);
              }}
            >
              <IconSymbol name="crop" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toolButton}
              onPress={() => {
                clearAll();
                setShowExpandedToolbar(false);
              }}
            >
              <IconSymbol name="trash" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
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
        
        {/* Crop Controls */}
        {showCropControls && (
          <View style={styles.cropControls}>
            <View style={styles.cropControlsContainer}>
              <Text style={styles.cropControlsTitle}>Crop Image</Text>
              <Text style={styles.cropControlsMessage}>
                Confirm to crop the image to the selected area
              </Text>
              
              <View style={styles.cropControlsButtons}>
                <TouchableOpacity 
                  style={[styles.cropButton, styles.cancelCropButton]}
                  onPress={handleCropCancel}
                >
                  <Text style={styles.cancelCropButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.cropButton, styles.confirmCropButton]}
                  onPress={handleCropConfirm}
                  disabled={isCropping}
                >
                  <Text style={styles.confirmCropButtonText}>
                    {isCropping ? 'Cropping...' : 'Crop'}
                  </Text>
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
  expandedToolbar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 10,
    width: 160, // Adjusted width to match main toolbar spacing
  },
  expandedToolbarLandscape: {
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
  cropOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    zIndex: 5,
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
  cropControls: {
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
  cropControlsContainer: {
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
  cropControlsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  cropControlsMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  cropControlsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cropButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelCropButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmCropButton: {
    backgroundColor: '#007AFF',
  },
  cancelCropButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmCropButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
