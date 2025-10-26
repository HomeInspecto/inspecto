import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Line, G, Ellipse } from 'react-native-svg';
import type { PathData } from '../hooks/use-photo-editor';

// Props for the SVG overlay component that handles drawing
interface SvgOverlayViewProps {
  screenDimensions: { width: number; height: number };
  paths: PathData[];
  currentPath: string;
  currentTool: string;
  currentColor: string;
  brushSize: number;
  selectedObjectId: string | null;
  onTouchStart: (event: any) => void;
  onTouchMove: (event: any) => void;
  onTouchEnd: (event: any) => void;
}

export default function SvgOverlayView({
  screenDimensions,
  paths,
  currentPath,
  currentTool,
  currentColor,
  brushSize,
  selectedObjectId,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: SvgOverlayViewProps) {
  return (
    <View 
      style={styles.svgOverlay}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      {...(Platform.OS === 'web' && {
        onMouseDown: onTouchStart,
        onMouseMove: onTouchMove,
        onMouseUp: onTouchEnd,
      })}
    >
      <Svg
        width={screenDimensions.width}
        height={screenDimensions.height}
      >
        {/* Render all saved drawing paths */}
        {paths.map((path) => {
          const isSelected = selectedObjectId === path.id;
          const strokeColor = isSelected ? '#007AFF' : path.stroke;
          const strokeWidth = isSelected ? path.strokeWidth + 2 : path.strokeWidth;
          
          // Render pen strokes
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
            // Render arrows with arrowheads
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
            // Render circles and ellipses (circles are just ellipses with equal rx/ry)
            return (
              <Ellipse
                key={path.id}
                cx={path.cx}
                cy={path.cy}
                rx={path.rx || path.r || 0}
                ry={path.ry || path.r || 0}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          }
          return null;
        })}
        {/* Render current drawing in progress */}
        {currentPath && (
          <>
            {/* Current pen stroke being drawn */}
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
            {/* Current circle/ellipse being drawn */}
            {currentTool === 'circle' && (() => {
              try {
                const pathData = JSON.parse(currentPath);
                return (
                  <Ellipse
                    cx={pathData.cx}
                    cy={pathData.cy}
                    rx={pathData.rx || pathData.r || 0}
                    ry={pathData.ry || pathData.r || 0}
                    stroke={currentColor}
                    strokeWidth={brushSize}
                    fill="none"
                  />
                );
              } catch (e) {
                // Fallback to path rendering if JSON parsing fails
              }
              return null;
            })()}
          </>
        )}
      </Svg>
    </View>
  );
}

// Styles for the SVG overlay component
const styles = StyleSheet.create({
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
