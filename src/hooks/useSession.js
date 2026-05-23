import { useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';

/**
 * Custom hook to consume the SessionContext.
 * Throws an error if used outside a SessionProvider.
 * @returns {object} The SessionContext values.
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}

export default useSession;
