import { useState } from 'react';

// Photo type for the active photo
export type Photo = {
  id: string;
  uri: string;
  timestamp: number;
};

// Props interface for the hook
export interface UseEditObservationProps {
}

// Return type for the hook
export interface UseEditObservationReturn {
  // State
  activePhoto: Photo | null;
  
  // Actions
  handleOpenPhoto: (photo: Photo) => void;
  handleClosePhoto: () => void;
}

// Custom hook for managing edit observation state
export function useEditObservation(props?: UseEditObservationProps): UseEditObservationReturn {
  // State for the currently active photo in the editor
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  // Function to open a photo in the editor
  const handleOpenPhoto = (photo: Photo) => {
    setActivePhoto(photo);
  };

  // Function to close the editor
  const handleClosePhoto = () => {
    setActivePhoto(null);
  };

  return {
    // State
    activePhoto,
    
    // Actions
    handleOpenPhoto,
    handleClosePhoto,
  };
}
