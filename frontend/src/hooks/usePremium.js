import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';

export const usePremium = () => {
  const { user } = useAuth();

  const { data: isPremium = false, isLoading } = useQuery({
    queryKey: ['premium-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-premium`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          return false; // Default to non-premium on error
        }

        const data = await response.json();
        return data.isPremium;
      } catch (error) {
        console.error('Error checking premium status:', error);
        return false; // Default to non-premium on error
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isPremium,
    isLoading,
    hasAccess: (template) => {
      if (!user?.id) return false; // If not logged in, no access to premium
      if (!template.is_premium) return true; // Non-premium templates are accessible
      return isPremium; // Premium templates require premium status
    }
  };
};