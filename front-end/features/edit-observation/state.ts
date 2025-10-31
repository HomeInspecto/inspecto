import { router } from 'expo-router';
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

export type Severity = 'critical' | 'medium' | 'low' | null;

export interface Observation {
  photos: PhotoWithMarkup[];
  fieldNote: string;

  name?: string;
  description?: string;

  implications?: string;
  recommendation?: string;

  severity?: Severity;
  section?: string;
}

interface ActiveObservationState extends Observation {
  activePhotoIndex: number;

  setActivePhoto: (i: number) => void;
  addPhoto: (photo: PhotoWithMarkup) => void;
  removePhotoById: (id: string) => void;
  updatePhoto: (id: string, newPhoto: PhotoWithMarkup) => void;

  setFieldNote: (note: string) => void;
  clearFieldNote: () => void;

  clearObservation: () => void;
  setObservation: (observation: Partial<Observation>) => void;
}

export const useActiveObservationStore = create<ActiveObservationState>(set => ({
  photos: [],
  fieldNote: '',

  // hard coded values for demo
  name: 'Broken Window Handle, Unable to Open',
  description:
    'The handle on the living room window is broken at the hinge joint, preventing the latch mechanism from releasing. The window cannot be opened from the inside. Metal fatigue and corrosion appear to have contributed to the failure.',
  implications:
    'Inability to open the window compromises ventilation and egress in an emergency. It may also lead to higher humidity and condensation buildup, potentially promoting mold growth.',
  recommendation:
    'Replace the handle assembly with a compatible part or install a new locking mechanism. Ensure proper alignment and function after replacement to restore normal operation.',
  severity: 'medium',

  setObservation: observation =>
    set(state => ({
      ...observation,
    })),

  activePhotoIndex: 0,

  setActivePhoto: i =>
    set(state => ({ activePhotoIndex: Math.min(Math.max(0, i), state.photos.length - 1) })),

  addPhoto: photo => set(state => ({ photos: [...state.photos, photo] })),
  updatePhoto: (id, newPhoto) =>
    set(state => ({
      photos: state.photos.map(p => (p.id === id ? { ...p, ...newPhoto } : p)),
    })),
  removePhotoById: id =>
    set(state => {
      const { photos, setActivePhoto, activePhotoIndex } = state;
      setActivePhoto(Math.max(activePhotoIndex - 1, 0));
      return {
        photos: photos.filter(p => p.id !== id),
      };
    }),

  setFieldNote: note => set({ fieldNote: note }),
  clearFieldNote: () => set({ fieldNote: '' }),

  clearObservation: () =>
    set({
      photos: [],
      fieldNote: '',
      activePhotoIndex: 0,
    }),
}));
