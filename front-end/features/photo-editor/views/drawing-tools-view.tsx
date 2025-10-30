import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import IconButton from '@/components/views/icon-button/icon-button';
import type { Tool } from '../photo-editor';

// Props for the drawing tools toolbar component
interface DrawingToolsViewProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
  undoLastShape: () => void;
}

export default function DrawingToolsView({
  currentTool,
  onToolSelect,
  undoLastShape,
}: DrawingToolsViewProps) {
  return (
    <View style={{ gap: 8 }}>
      <IconButton
        icon="pencil"
        onPress={() => onToolSelect('pen')}
        color={currentTool === 'pen' ? 'primary' : 'secondary'}
      />

      <IconButton
        icon="arrow.up.right"
        onPress={() => onToolSelect('arrow')}
        color={currentTool === 'arrow' ? 'primary' : 'secondary'}
      />

      <IconButton
        icon="circle"
        onPress={() => onToolSelect('circle')}
        color={currentTool === 'circle' ? 'primary' : 'secondary'}
      />

      <IconButton
        icon="arrow.uturn.left"
        onPress={() => undoLastShape()}
        color={currentTool === 'circle' ? 'primary' : 'secondary'}
      />
    </View>
  );
}
