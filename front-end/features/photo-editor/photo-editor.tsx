import Text from '@/components/views/text/text';
import { usePhotoEditor } from './hooks/use-photo-editor';
import type { Photo } from './hooks/use-photo-editor';
import { PhotoEditorView } from './views/photo-editor-view';

interface BaseShape {
  id: string; // Unique identifier
  strokeColor: string; // Color (hex like '#FF0000')
  strokeWidth: number; // Line thickness
}

interface PathShape extends BaseShape {
  type: 'pen';
  d: string; // SVG path data (e.g., "M10 10 L20 20")
}

// For arrows (line + arrowhead)
interface ArrowShape extends BaseShape {
  type: 'arrow';
  x1: number; // Start X
  y1: number; // Start Y
  x2: number; // End X
  y2: number; // End Y
}

// For circles or ellipses
interface CircleShape extends BaseShape {
  type: 'circle';
  cx: number; // Center X
  cy: number; // Center Y
  rx: number; // Radius X
  ry: number; // Radius Y
}

// Optionally, a union type for convenience
export type Shape = PathShape | ArrowShape | CircleShape;

export type Tool = 'pen' | 'arrow' | 'circle';

export interface PhotoEditorProps {
  photo: Photo;
  currentTool: 'pen' | 'arrow' | 'circle';
  shapes: Shape[];
  previewShape: string;

  setCurrentTool: (tool: Tool) => void;

  handleTouchStart: (event: TouchEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;

  clearMarkup: () => void;
  deleteActivePhoto: () => void;

  goBack: () => void;
}

export default function PhotoEditor() {
  const props = usePhotoEditor();
  if (props.photo) return <PhotoEditorView {...props} photo={props.photo} />;
  else return <Text>No active photo</Text>;
}
