import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AmbassadorStats, AmbassadorReferral, AmbassadorEarning } from '@/types';

export const useAmbassadorStats = (userId: string) => {
  const [stats, setStats] = useState<AmbassadorStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [profileResult, referralsResult, earningsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', userId)
          .single(),
        supabase
          .from('ambassador_referrals')
          .select('*')
          .eq('ambassador_id', userId),
        supabase
          .from('ambassador_earnings')
          .select('*')
          .eq('ambassador_id', userId)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (referralsResult.error) throw referralsResult.error;
      if (earningsResult.error) throw earningsResult.error;

      const referrals = referralsResult.data as AmbassadorReferral[];
      const earnings = earningsResult.data as AmbassadorEarning[];

      const activeReferrals = referrals.filter(r => r.status === 'active').length;
      const completedReferrals = referrals.filter(r => r.status === 'completed').length;
      const totalEarnings = earnings
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + e.amount, 0);
      const pendingEarnings = earnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.amount, 0);

      setStats({
        referralCode: profileResult.data?.referral_code || '',
        totalReferrals: referrals.length,
        activeReferrals,
        completedReferrals,
        totalEarnings,
        pendingEarnings
      });
    } catch (error) {
      console.error('Error loading ambassador stats:', error);
      toast.error('Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, reload: loadStats };
};
