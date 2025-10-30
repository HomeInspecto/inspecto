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

export const useActiveInspectionStore = create<ActiveInspectionStore>(set => ({
  activeInspection: undefined,
  setActiveInspection: inspection =>
    set(() => ({
      activeInspection: inspection,
    })),
  clearActiveInspection: () =>
    set(() => ({
      activeInspection: undefined,
    })),
  addObservation: observation =>
    set(state => ({
      activeInspection: state.activeInspection
        ? {
            ...state.activeInspection,
            observations: [...state.activeInspection.observations, observation],
          }
        : state.activeInspection,
    })),
}));
