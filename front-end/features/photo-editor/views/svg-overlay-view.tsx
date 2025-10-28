import type { Shape } from '@/features/edit-observation/state';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Line, G, Ellipse } from 'react-native-svg';
import type { Tool } from '../photo-editor';

// Props for the SVG overlay component that handles drawing
interface SvgOverlayViewProps {
  shapes: Shape[];
  previewShape: string;
  currentTool: Tool;
  onTouchStart: (event: any) => void;
  onTouchMove: (event: any) => void;
  onTouchEnd: (event: any) => void;
}

export default function SvgOverlayView({
  shapes,
  previewShape,
  currentTool,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: SvgOverlayViewProps) {
  return (
    <View
      style={{ position: 'absolute', width: '100%', height: '100%' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      {...(Platform.OS === 'web' && {
        onMouseDown: onTouchStart,
        onMouseMove: onTouchMove,
        onMouseUp: onTouchEnd,
      })}
    >
      <Svg width="100%" height="100%">
        {shapes.map(shape => {
          const strokeColor = shape.strokeColor;
          const strokeWidth = shape.strokeWidth;

          if (shape.type === 'pen') {
            return (
              <Path
                key={shape.id}
                d={shape.d}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          } else if (shape.type === 'arrow') {
            const angle = Math.atan2(shape.y2! - shape.y1!, shape.x2! - shape.x1!);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6; // 30 degrees

            const arrowX1 = shape.x2! - arrowLength * Math.cos(angle - arrowAngle);
            const arrowY1 = shape.y2! - arrowLength * Math.sin(angle - arrowAngle);
            const arrowX2 = shape.x2! - arrowLength * Math.cos(angle + arrowAngle);
            const arrowY2 = shape.y2! - arrowLength * Math.sin(angle + arrowAngle);

            return (
              <G key={shape.id}>
                <Line
                  x1={shape.x1}
                  y1={shape.y1}
                  x2={shape.x2}
                  y2={shape.y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                <Line
                  x1={shape.x2}
                  y1={shape.y2}
                  x2={arrowX1}
                  y2={arrowY1}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                <Line
                  x1={shape.x2}
                  y1={shape.y2}
                  x2={arrowX2}
                  y2={arrowY2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              </G>
            );
          } else if (shape.type === 'circle') {
            // Render circles and ellipses (circles are just ellipses with equal rx/ry)
            return (
              <Ellipse
                key={shape.id}
                cx={shape.cx}
                cy={shape.cy}
                rx={shape.rx || 0}
                ry={shape.ry || 0}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          }
          return null;
        })}
        {previewShape && (
          <>
            {currentTool === 'pen' && (
              <Path
                d={previewShape}
                stroke={'red'}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {currentTool === 'circle' &&
              (() => {
                try {
                  const shapeData = JSON.parse(previewShape);
                  return (
                    <Ellipse
                      cx={shapeData.cx}
                      cy={shapeData.cy}
                      rx={shapeData.rx || shapeData.r || 0}
                      ry={shapeData.ry || shapeData.r || 0}
                      stroke={shapeData.strokeColor}
                      strokeWidth={shapeData.strokeWidth}
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
