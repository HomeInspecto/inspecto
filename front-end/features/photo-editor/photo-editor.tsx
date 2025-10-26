import React from 'react';
import { View, StyleSheet, Platform, StatusBar, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePhotoEditor } from './hooks/use-photo-editor';
import type { PhotoEditorProps } from './hooks/use-photo-editor';
import DrawingToolsView from './views/drawing-tools-view';
import ColorPickerView from './views/color-picker-view';
import SvgOverlayView from './views/svg-overlay-view';

export default function PhotoEditor({ photo, onClose }: PhotoEditorProps) {
  const {
    // State
    screenDimensions,
    currentTool,
    currentColor,
    brushSize,
    paths,
    currentPath,
    showColorPicker,
    showSaveModal,
    showExpandedToolbar,
    selectedObjectId,
    colors,
    isLandscape,
    
    // Actions
    setCurrentTool,
    setCurrentColor,
    setShowColorPicker,
    setShowExpandedToolbar,
    
    // Functions
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearAll,
    handleClose,
    handleSaveChanges,
    handleDiscardChanges,
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
                  onError={() => {}}
        />
        
        <SvgOverlayView
          screenDimensions={screenDimensions}
          paths={paths}
          currentPath={currentPath}
          currentTool={currentTool}
          currentColor={currentColor}
          brushSize={brushSize}
          selectedObjectId={selectedObjectId}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        <DrawingToolsView
          currentTool={currentTool}
          currentColor={currentColor}
          showExpandedToolbar={showExpandedToolbar}
          isLandscape={isLandscape}
          onToolSelect={setCurrentTool}
          onToggleExpandedToolbar={() => {
            setShowExpandedToolbar(!showExpandedToolbar);
            setShowColorPicker(false);
          }}
          onToggleColorPicker={() => {
            setShowColorPicker(!showColorPicker);
            setShowExpandedToolbar(false);
          }}
          onClearAll={clearAll}
          onClose={handleClose}
        />
        
        <ColorPickerView
          showColorPicker={showColorPicker}
          currentColor={currentColor}
          colors={colors}
          isLandscape={isLandscape}
          onColorSelect={setCurrentColor}
          onClose={() => setShowColorPicker(false)}
        />
        
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

// Styles for the photo editor component
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
