-- Fix function search_path warning for update_recruiter_rankings
CREATE OR REPLACE FUNCTION public.update_recruiter_rankings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  WITH ranked_recruiters AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY avg_trs DESC, total_referral_earnings DESC) as rank
    FROM recruiter_stats
  )
  UPDATE recruiter_stats rs
  SET 
    ranking_position = rr.rank,
    badge_type = CASE 
      WHEN rr.rank = 1 THEN 'gold'
      WHEN rr.rank = 2 THEN 'silver'
      WHEN rr.rank = 3 THEN 'bronze'
      ELSE 'none'
    END,
    last_updated = NOW()
  FROM ranked_recruiters rr
  WHERE rs.user_id = rr.user_id;
END;
$function$;