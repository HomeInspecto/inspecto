import { create } from 'zustand';

export interface Inspection {
  id: string;
  client: string;
  address: string;
  createdAt: number;
}

export interface InspectionStore {
  inspections: Inspection[];
  createInspection: (inspection: Inspection) => void;
  setInspections: (inspections: Inspection[]) => void;
}

export const useInspectionsStore = create<InspectionStore>(set => ({
  inspections: [],
  createInspection: (inspection: Inspection) =>
    set(state => ({
      inspections: [...state.inspections, inspection],
    })),
  setInspections: (inspections: Inspection[]) =>
    set(state => ({
      inspections,
    })),
}));
