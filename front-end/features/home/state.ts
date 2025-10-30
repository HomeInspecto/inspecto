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

const dummyInspection2: Inspection = {
  id: 'lmquckr4ql2',
  client: 'Kelly Brown',
  address: '3172 Cedar Hill Rd',
  createdAt: 1761792433130,
};

export const useInspectionsStore = create<InspectionStore>(set => ({
  inspections: [dummyInspection, dummyInspection2],
  createInspection: (inspection: Inspection) =>
    set(state => ({
      inspections: [...state.inspections, inspection],
    })),
}));
