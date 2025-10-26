import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { EditorTool } from '../hooks/use-photo-editor';

// Props for the drawing tools toolbar component
interface DrawingToolsViewProps {
  currentTool: EditorTool;
  currentColor: string;
  showExpandedToolbar: boolean;
  isLandscape: boolean;
  onToolSelect: (tool: EditorTool) => void;
  onToggleExpandedToolbar: () => void;
  onToggleColorPicker: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function DrawingToolsView({
  currentTool,
  currentColor,
  showExpandedToolbar,
  isLandscape,
  onToolSelect,
  onToggleExpandedToolbar,
  onToggleColorPicker,
  onClearAll,
  onClose,
}: DrawingToolsViewProps) {
  return (
    <>
      {/* Main Toolbar */}
      <View style={[styles.toolbar, isLandscape && styles.toolbarLandscape]}>
        {/* Drawing tools */}
        <TouchableOpacity 
          style={[styles.toolButton, currentTool === 'pen' && styles.activeTool]}
          onPress={() => onToolSelect('pen')}
        >
          <IconSymbol name="pencil" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, currentTool === 'arrow' && styles.activeTool]}
          onPress={() => onToolSelect('arrow')}
        >
          <IconSymbol name="arrow.right" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, currentTool === 'circle' && styles.activeTool]}
          onPress={() => onToolSelect('circle')}
        >
          <IconSymbol name="circle" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, currentTool === 'eraser' && styles.activeTool]}
          onPress={() => onToolSelect('eraser')}
        >
          <IconSymbol name="eraser" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Color picker button */}
        <TouchableOpacity 
          style={[styles.toolButton, styles.colorPickerButton]}
          onPress={onToggleColorPicker}
        >
          <View style={[styles.colorIndicator, { backgroundColor: currentColor }]} />
        </TouchableOpacity>
        
        {/* More tools button */}
        <TouchableOpacity 
          style={[styles.toolButton, showExpandedToolbar && styles.activeTool]}
          onPress={onToggleExpandedToolbar}
        >
          <IconSymbol name="ellipsis" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Close button */}
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={onClose}
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
              onToolSelect('hand');
              onToggleExpandedToolbar();
            }}
          >
            <IconSymbol name="hand.raised" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Disabled crop tool */}
          <TouchableOpacity 
            style={[styles.toolButton, styles.disabledTool]}
            disabled={true}
          >
            <IconSymbol name="crop" size={24} color="#666" />
          </TouchableOpacity>
          
          {/* Clear all drawings */}
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => {
              onClearAll();
              onToggleExpandedToolbar();
            }}
          >
            <IconSymbol name="trash" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </>
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
