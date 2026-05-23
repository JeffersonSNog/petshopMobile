import React, { createContext, useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';

export const PetsContext = createContext(null);

const DEFAULT_FILTERS = {
  petType: 'Both',
  breed: 'All',
};

export function PetsProvider({ children }) {
  const [pets, setPets] = useState([]);
  const [favoritePets, setFavoritePets] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches the full list of pets from the api.
   */
  const fetchPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPets();
      const petsList = Array.isArray(data) ? data : (data?.pets || []);
      setPets(petsList);
    } catch (err) {
      console.error('Failed to fetch pets list:', err);
      setError(err.message || 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pets on mount
  useEffect(() => {
    fetchPets();
  }, []);

  /**
   * Updates current list filters.
   * @param {object} newFilters
   */
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  /**
   * Toggles the favorited state of a pet.
   * @param {string} id - The ID of the pet.
   */
  const toggleFavorite = (id) => {
    setFavoritePets((prevFavorites) => {
      const isAlreadyFav = prevFavorites.some((pet) => (pet._id || pet.id) === id);
      let updated;
      
      if (isAlreadyFav) {
        updated = prevFavorites.filter((pet) => (pet._id || pet.id) !== id);
      } else {
        const petToAdd = pets.find((pet) => (pet._id || pet.id) === id);
        if (petToAdd) {
          updated = [...prevFavorites, petToAdd];
        } else {
          updated = prevFavorites;
        }
      }

      // Note: For local persistence, you could run:
      // await AsyncStorage.setItem('favorites', JSON.stringify(updated));

      return updated;
    });
  };

  /**
   * Computes the filtered list of pets based on current filters.
   */
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      // Filter by pet type (e.g. 'Dog', 'Cat')
      if (filters.petType !== 'Both' && pet.type !== filters.petType) {
        return false;
      }
      // Filter by breed
      if (filters.breed !== 'All' && pet.breed !== filters.breed) {
        return false;
      }
      return true;
    });
  }, [pets, filters]);

  const value = {
    pets,
    favoritePets,
    filteredPets,
    filters,
    loading,
    error,
    fetchPets,
    toggleFavorite,
    updateFilters,
  };

  return (
    <PetsContext.Provider value={value}>
      {children}
    </PetsContext.Provider>
  );
}

export default PetsContext;
