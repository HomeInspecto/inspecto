import { useCallback, useState } from 'react';
import type { Inspection } from '../state';

export function useInspections() {
  const inspections: Inspection[] = [];

  const selectInspection = () => {};

  return {
    inspections,
    selectInspection,
  };
}
