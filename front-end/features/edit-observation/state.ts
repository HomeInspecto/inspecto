import { create } from 'zustand';

interface BaseShape {
  id: string;
  strokeColor: string;
  strokeWidth: number;
}

interface PathShape extends BaseShape {
  type: 'pen';
  d: string; // SVG path data (e.g., "M10 10 L20 20")
}

interface ArrowShape extends BaseShape {
  type: 'arrow';
  x1: number; // Start X
  y1: number; // Start Y
  x2: number; // End X
  y2: number; // End Y
}

interface CircleShape extends BaseShape {
  type: 'circle';
  cx: number; // Center X
  cy: number; // Center Y
  rx: number; // Radius X
  ry: number; // Radius Y
}

export type Shape = PathShape | ArrowShape | CircleShape;

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

export interface PhotoWithMarkup extends Photo {
  shapes?: Shape[];
}

interface ActiveObservationState {
  photos: Photo[];
  fieldNote: string;
  activePhotoIndex: number;

  setActivePhoto: (i: number) => void;
  addPhoto: (photo: Photo) => void;
  removePhotoById: (id: string) => void;

  setFieldNote: (note: string) => void;
  clearFieldNote: () => void;
}

export const useActiveObservationStore = create<ActiveObservationState>(set => ({
  photos: [],
  fieldNote: '',
  activePhotoIndex: 0,

  setActivePhoto: i => set({ activePhotoIndex: i }),

  addPhoto: photo => set(state => ({ photos: [...state.photos, photo] })),
  removePhotoById: id =>
    set(state => ({
      photos: state.photos.filter(p => p.id !== id),
    })),

  setFieldNote: note => set({ fieldNote: note }),
  clearFieldNote: () => set({ fieldNote: '' }),
}));
