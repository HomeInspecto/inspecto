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
  createdAt: 1761879095780,
  observations: [
    {
      name: 'Damaged Roof Shingle',
      description: 'Several shingles on the south-facing slope are cracked and curling.',
      implications:
        'Potential for water intrusion during heavy rain, leading to interior ceiling damage.',
      recommendation: 'Schedule a roofing contractor to replace the damaged shingles promptly.',
      section: 'Roofing',
      severity: 'medium' as const,
      fieldNote: 'Visible cracks near the ridge line; photographed for reference.',
      photos: [],
    },
    {
      name: 'Leaking Kitchen Sink Trap',
      description: 'P-trap shows active drip when water runs through the sink.',
      implications: 'May damage cabinet base and attract pests if left unresolved.',
      recommendation: 'Replace the trap assembly and verify all compression fittings are sealed.',
      section: 'Plumbing',
      severity: 'critical' as const,
      fieldNote: 'Placed a bowl underneath; leak confirmed during inspection.',
      photos: [],
    },
    {
      name: 'Loose Stair Handrail',
      description: 'Handrail at the basement stairs wobbles with minimal pressure.',
      implications: 'Safety hazard for occupants using the stairs, especially children or elderly.',
      recommendation: 'Re-secure handrail brackets with longer anchors into wall studs.',
      section: 'Interior',
      severity: 'medium' as const,
      fieldNote: 'Movement observed at both top and bottom brackets.',
      photos: [],
    },
    {
      name: 'Putrid Smell in the Closet',
      description: 'There is a putrid smell in the closet.',
      implications: 'The smell is coming from the closet.',
      recommendation: 'Clean the closet.',
      section: 'Interior',
      severity: 'medium' as const,
      fieldNote: 'Smell observed during inspection.',
      photos: [],
    },
    {
      name: 'Insufficient Attic Insulation',
      description: 'Attic insulation depth averages 6 inches, below recommended levels.',
      implications: 'Reduced energy efficiency; higher heating and cooling costs.',
      recommendation: 'Install additional blown-in insulation to reach R-38 or higher.',
      section: 'Energy Efficiency',
      severity: 'low' as const,
      fieldNote: 'Noted during attic walkthrough; temperature differential measured at hatch.',
      photos: [],
    },
  ],
};

export const useActiveInspectionStore = create<ActiveInspectionStore>((set, get) => ({
  activeInspection: undefined,

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
