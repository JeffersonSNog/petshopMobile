import { useContext } from 'react';
import { PetsContext } from '../contexts/PetsContext';

/**
 * Custom hook to consume the PetsContext.
 * Throws an error if used outside a PetsProvider.
 * @returns {object} The PetsContext values.
 */
export function usePets() {
  const context = useContext(PetsContext);
  if (!context) {
    throw new Error('usePets must be used within PetsProvider');
  }
  return context;
}

export default usePets;
