import { View, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawingToolsView from './drawing-tools-view';
import SvgOverlayView from './svg-overlay-view';
import type { PhotoEditorProps } from '../photo-editor';
import IconButton from '@/components/views/icon-button/icon-button';

export function PhotoEditorView({
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
}: PhotoEditorProps) {
  return (
    <GestureHandlerRootView>
      <View
        style={{
          flex: 1,
          width: '100%',
          aspectRatio: '3 / 4',
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Image
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          source={{ uri: photo.uri }}
          contentFit="contain"
          onError={() => {}}
        />

        <SvgOverlayView
          shapes={shapes}
          previewShape={previewShape}
          currentTool={currentTool}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        <View style={{ paddingLeft: 20 }}>
          <IconButton icon="TODO-get-back-icon" onPress={goBack} color={'critical'} />
        </View>

        <View
          style={{
            gap: 8,
          }}
        >
          <DrawingToolsView
            onToolSelect={tool => setCurrentTool(tool)}
            currentTool={currentTool}
            clearMarkup={clearMarkup}
          />
          <IconButton icon="trash" onPress={deleteActivePhoto} color={'critical'} />
        </View>
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
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        }
      : {
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
