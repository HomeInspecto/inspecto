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

const fridayInspection: Inspection = {
  id: 'mqalmquckadar4ql2',
  client: 'Peggy & Claudia',
  address: 'Startup Studio, Harry Hickman Building (HHB)',
  createdAt: 1761879095780,
};

export const dummyInspection: Inspection = {
  id: 'ablmquck12312r4ql',
  client: 'Michael Johnson',
  address: '2444 Royal Oak dr',
  createdAt: 1761792433130,
};

const dummyInspection2: Inspection = {
  id: 'llmquc1213kr4ql2',
  client: 'Kelly Brown',
  address: '3172 Cedar Hill Rd',
  createdAt: 1761792433130,
};

export const useInspectionsStore = create<InspectionStore>(set => ({
  inspections: [fridayInspection, dummyInspection, dummyInspection2],
  createInspection: (inspection: Inspection) =>
    set(state => ({
      inspections: [...state.inspections, inspection],
    })),
  setInspections: (inspections: Inspection[]) =>
    set(state => ({
      inspections,
    })),
}));
