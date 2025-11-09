// Web Vibration API for haptic feedback
export const hapticFeedback = {
  light: async () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch (e) {
      // Haptics not available, silently fail
    }
  },
  
  medium: async () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    } catch (e) {
      // Haptics not available, silently fail
    }
  },
  
  heavy: async () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch (e) {
      // Haptics not available, silently fail
    }
  },
  
  success: async () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (e) {
      // Haptics not available, silently fail
    }
  },
  
  error: async () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
    } catch (e) {
      // Haptics not available, silently fail
    }
  },
  
  selection: async () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
    } catch (e) {
      // Haptics not available, silently fail
    }
  }
};
