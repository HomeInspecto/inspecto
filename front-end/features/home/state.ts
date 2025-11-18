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

const dummyInspection: Inspection = {
  id: 'llmquc1213kr4ql2',
  client: 'Kelly Brown',
  address: '3172 Cedar Hill Rd',
  createdAt: 1761792433130,
};

export const useInspectionsStore = create<InspectionStore>(set => ({
  inspections: [dummyInspection],
  createInspection: (inspection: Inspection) =>
    set(state => ({
      inspections: [...state.inspections, inspection],
    })),
  setInspections: (inspections: Inspection[]) =>
    set(state => ({
      inspections,
    })),
}));
