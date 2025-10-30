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
}

const dummyInspection: Inspection = {
  id: 'lmquckr4ql',
  client: 'Michael Johnson',
  address: '2444 Royal Oak dr',
  createdAt: 1761792433130,
};

export const useInspectionsStore = create<InspectionStore>(set => ({
  inspections: [dummyInspection, dummyInspection],
  createInspection: (inspection: Inspection) =>
    set(state => ({
      inspections: [...state.inspections, inspection],
    })),
}));
