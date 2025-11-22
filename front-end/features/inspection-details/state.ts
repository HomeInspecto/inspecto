import { create } from 'zustand';
import type { Observation } from '../edit-observation/state';
import { useShallow } from 'zustand/shallow';

export interface ActiveInspection {
  id: string;
  client: string;
  address: string;
  createdAt: number;
  observations?: Observation[];
}

export interface ActiveInspectionStore {
  activeInspection?: ActiveInspection;
  setActiveInspection: (inspection: ActiveInspection) => void;
  clearActiveInspection: () => void;
  addObservation: (observation: Observation) => void;
  sectionMap: Map<string, string>;
  setSectionMap: (map: Map<string, string>) => void;
}

export const useActiveInspectionStore = create<ActiveInspectionStore>((set, get) => ({
  activeInspection: undefined,
  sectionMap: new Map<string, string>(),

  setActiveInspection: inspection => set({ activeInspection: inspection }),

  clearActiveInspection: () => set({ activeInspection: undefined }),

  addObservation: observation =>
    set(state => {
      const ai = state.activeInspection;
      if (!ai) return state; // no-op: don't notify subscribers
      return {
        activeInspection: {
          ...ai,
          observations: [...(ai.observations ?? []), observation],
        },
      };
    }),

  setSectionMap: map => set({ sectionMap: map }),
}));
