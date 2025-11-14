import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface XPAction {
  type: 'post' | 'comment' | 'like' | 'share' | 'login' | 'profile_complete';
  points: number;
}

const XP_ACTIONS: Record<XPAction['type'], number> = {
  post: 5,
  comment: 3,
  like: 1,
  share: 10,
  login: 2,
  profile_complete: 20,
};

const XP_PER_LEVEL = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  11000, // Level 10
];

interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export const useXPSystem = (userId: string) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<Badge[]>([
    { id: 'active', name: 'Attivo', description: 'Accedi 3 volte al giorno', earned: false },
    { id: 'social', name: 'Social', description: 'Pubblica 10 contenuti', earned: false },
    { id: 'sharer', name: 'Condivisore', description: 'Condividi 5 volte', earned: false },
    { id: 'top', name: 'Top Talent', description: 'Raggiungi il livello 5', earned: false },
  ]);

  // Load XP from localStorage
  useEffect(() => {
    const storedXP = localStorage.getItem(`xp_${userId}`);
    const storedLevel = localStorage.getItem(`level_${userId}`);
    const storedBadges = localStorage.getItem(`badges_${userId}`);

    if (storedXP) setXp(parseInt(storedXP));
    if (storedLevel) setLevel(parseInt(storedLevel));
    if (storedBadges) setBadges(JSON.parse(storedBadges));
  }, [userId]);

  // Save XP to localStorage
  useEffect(() => {
    localStorage.setItem(`xp_${userId}`, xp.toString());
    localStorage.setItem(`level_${userId}`, level.toString());
    localStorage.setItem(`badges_${userId}`, JSON.stringify(badges));
  }, [xp, level, badges, userId]);

  // Calculate level from XP
  const calculateLevel = useCallback((currentXP: number) => {
    for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
      if (currentXP >= XP_PER_LEVEL[i]) {
        return i + 1;
      }
    }
    return 1;
  }, []);

  // Add XP
  const addXP = useCallback((actionType: XPAction['type']) => {
    const points = XP_ACTIONS[actionType];
    const newXP = xp + points;
    const newLevel = calculateLevel(newXP);
    
    setXp(newXP);
    
    // Show XP toast
    toast.success(`+${points} XP`, {
      description: getActionLabel(actionType),
      duration: 2000,
    });

    // Level up
    if (newLevel > level) {
      setLevel(newLevel);
      toast.success(`🎉 Livello ${newLevel}!`, {
        description: `Hai raggiunto il livello ${newLevel}!`,
        duration: 3000,
      });

      // Check badges
      if (newLevel >= 5 && !badges.find(b => b.id === 'top')?.earned) {
        setBadges(prev => prev.map(b => 
          b.id === 'top' ? { ...b, earned: true } : b
        ));
        toast.success(`🏆 Badge: ${badges.find(b => b.id === 'top')?.name}`, {
          duration: 3000,
        });
      }
    }
  }, [xp, level, badges, calculateLevel]);

  const getActionLabel = (actionType: XPAction['type']): string => {
    const labels: Record<XPAction['type'], string> = {
      post: 'Hai pubblicato un post',
      comment: 'Hai commentato',
      like: 'Hai messo mi piace',
      share: 'Hai condiviso',
      login: 'Login giornaliero',
      profile_complete: 'Profilo completato',
    };
    return labels[actionType];
  };

  const getXPToNextLevel = () => {
    if (level >= XP_PER_LEVEL.length) return 0;
    return XP_PER_LEVEL[level];
  };

  return {
    xp,
    level,
    badges,
    addXP,
    xpToNextLevel: getXPToNextLevel(),
  };
};
