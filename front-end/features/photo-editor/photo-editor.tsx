import Text from '@/components/views/text/text';
import { usePhotoEditor } from './hooks/use-photo-editor';
import { PhotoEditorView } from './views/photo-editor-view';
import type { PhotoWithMarkup } from '@/features/edit-observation/state';
import { Animated } from 'react-native';

export type Tool = 'pen' | 'arrow' | 'circle' | null;

export interface PhotoEditorProps {
  photo: PhotoWithMarkup;
  photos: PhotoWithMarkup[];
  currentTool: Tool;
  previewShape: string;

  setCurrentTool: (tool: Tool) => void;

  handleTouchStart: (event: TouchEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;

  undoLastShape: () => void;
  deleteActivePhoto: () => void;

  goBack: () => void;

  translateX: Animated.Value;
  screenWidth: number;
}

export default function PhotoEditor() {
  const props = usePhotoEditor();
  if (props.photo) return <PhotoEditorView {...props} photo={props.photo} />;
  else return <Text>No active photo</Text>;
}
