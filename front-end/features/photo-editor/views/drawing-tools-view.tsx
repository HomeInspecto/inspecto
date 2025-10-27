import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import IconButton from '@/components/views/icon-button/icon-button';
import type { Tool } from '../photo-editor';

// Props for the drawing tools toolbar component
interface DrawingToolsViewProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
  clearMarkup: () => void;
}

export default function DrawingToolsView({
  currentTool,
  onToolSelect,
  clearMarkup,
}: DrawingToolsViewProps) {
  return (
    <View style={{ gap: 8, paddingRight: 20 }}>
      <IconButton
        icon="pencil"
        onPress={() => onToolSelect('pen')}
        color={currentTool === 'pen' ? 'primary' : 'secondary'}
      />

      <IconButton
        icon="arrow.right"
        onPress={() => onToolSelect('arrow')}
        color={currentTool === 'arrow' ? 'primary' : 'secondary'}
      />

      <IconButton
        icon="circle"
        onPress={() => onToolSelect('circle')}
        color={currentTool === 'circle' ? 'primary' : 'secondary'}
      />
    </View>
  );
}

// Styles for the drawing tools toolbar
const styles = StyleSheet.create({
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
    width: 160,
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
  disabledTool: {
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    opacity: 0.5,
  },
  colorPickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
});
