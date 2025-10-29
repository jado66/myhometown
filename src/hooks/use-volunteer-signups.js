import { useState, useEffect, useCallback } from 'react';

export const useVolunteerSignups = (communityId = null, searchTerm = '') => {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 50,
    total: 0,
  });

  const fetchSignups = useCallback(async (page = 0, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (communityId) {
        params.append('communityId', communityId);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/volunteer-signup?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch volunteer signups');
      }

      if (result.success) {
        setSignups(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error fetching volunteer signups:', err);
      setError(err.message);
      setSignups([]);
    } finally {
      setLoading(false);
    }
  }, [communityId, searchTerm]);

  useEffect(() => {
    fetchSignups(0, pagination.limit);
  }, [fetchSignups]);

  const refetch = useCallback(() => {
    fetchSignups(pagination.page, pagination.limit);
  }, [fetchSignups, pagination.page, pagination.limit]);

  const changePage = useCallback((newPage) => {
    fetchSignups(newPage, pagination.limit);
  }, [fetchSignups, pagination.limit]);

  const changeLimit = useCallback((newLimit) => {
    fetchSignups(0, newLimit);
  }, [fetchSignups]);

  return {
    signups,
    loading,
    error,
    pagination,
    refetch,
    changePage,
    changeLimit,
  };
};