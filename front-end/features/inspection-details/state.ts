import { create } from 'zustand';
import type { Observation } from '../edit-observation/state';

export interface ActiveInspection {
  id: string;
  client: string;
  address: string;
  createdAt: number;
  observations: Observation[];
}

export interface ActiveInspectionStore {
  activeInspection?: ActiveInspection;
  setActiveInspection: (inspection: ActiveInspection) => void;
  clearActiveInspection: () => void;
  addObservation: (observation: Observation) => void;
}

const dummyInspection = {
  id: 'lmquckr4ql',
  client: 'Michael Johnson',
  address: '2444 Royal Oak dr',
  createdAt: 1761792433130,
  observations: [],
};

export const useActiveInspectionStore = create<ActiveInspectionStore>((set, get) => ({
  activeInspection: structuredClone(dummyInspection),

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
}));
