import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';

// Props for the color picker component
interface ColorPickerViewProps {
  showColorPicker: boolean;
  currentColor: string;
  colors: string[];
  isLandscape: boolean;
  onColorSelect: (color: string) => void;
  onClose: () => void;
}

export default function ColorPickerView({
  showColorPicker,
  currentColor,
  colors,
  isLandscape,
  onColorSelect,
  onClose,
}: ColorPickerViewProps) {
  if (!showColorPicker) return null;

  return (
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
            onColorSelect(color);
            onClose();
          }}
        />
      ))}
    </View>
  );
}

// Styles for the color picker component
const styles = StyleSheet.create({
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
});
