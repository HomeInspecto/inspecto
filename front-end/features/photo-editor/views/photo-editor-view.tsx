import { View, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawingToolsView from './drawing-tools-view';
import SvgOverlayView from './svg-overlay-view';
import type { PhotoEditorProps } from '../photo-editor';
import IconButton from '@/components/views/icon-button/icon-button';

export function PhotoEditorView({
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
          alignItems: 'flex-start',
        }}
      >
        <Image
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            aspectRatio: '3/4',
          }}
          source={{ uri: photo.uri }}
          contentFit="cover"
          onError={() => {}}
        />

        <SvgOverlayView
          shapes={photo.shapes || []}
          previewShape={previewShape}
          currentTool={currentTool}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        <View style={{ marginLeft: 20, marginTop: 16 }}>
          <IconButton icon="chevron.left" onPress={goBack} color={'critical'} />
        </View>

        <View
          style={{
            gap: 8,
            marginRight: 20,
            marginTop: 16,
          }}
        >
          <DrawingToolsView
            onToolSelect={tool => currentTool !== tool? setCurrentTool(tool): setCurrentTool(null)}
            currentTool={currentTool}
            undoLastShape={undoLastShape}
          />
          <IconButton icon="trash" onPress={deleteActivePhoto} color={'critical'} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
