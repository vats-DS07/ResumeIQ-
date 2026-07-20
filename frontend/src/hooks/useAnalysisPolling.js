import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useAnalysisPolling = (analysisId) => {
  return useQuery({
    queryKey: ['analysisStatus', analysisId],
    queryFn: () => api.get(`/api/analysis/status/${analysisId}`),
    enabled: !!analysisId,
    refetchInterval: (query) => {
      const data = query?.state?.data;
      if (data && (data.status === 'COMPLETED' || data.status === 'FAILED')) {
        return false; // Stop polling completely
      }
      return 2000; // Poll every 2 seconds
    },
    refetchOnWindowFocus: false,
  });
};
