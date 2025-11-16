import { View, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawingToolsView from './drawing-tools-view';
import SvgOverlayView from './svg-overlay-view';
import type { PhotoEditorProps } from '../photo-editor';
import IconButton from '@/components/views/icon-button/icon-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

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
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: COLORS.pageBackground }}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <Image
            style={{ width: '100%', height: '100%', }}
            source={{ uri: photo.uri }}
            contentFit="cover"
            onError={() => {}}
          />
        </View>

        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', }}
        >
          <SvgOverlayView
            shapes={photo.shapes || []}
            previewShape={previewShape}
            currentTool={currentTool}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: insets.top + 16, }}
          >
            <View style={{ marginLeft: 4 }}>
              <IconButton icon="chevron.left" onPress={goBack} color={'critical'} />
            </View>

            <View
              style={{ gap: 8, marginRight: 4, }}
            >
              <DrawingToolsView
                onToolSelect={ tool => currentTool !== tool ? setCurrentTool(tool) : setCurrentTool(null) }
                currentTool={currentTool}
                undoLastShape={undoLastShape}
              />
              <IconButton icon="trash" onPress={deleteActivePhoto} color={'critical'} />
            </View>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
