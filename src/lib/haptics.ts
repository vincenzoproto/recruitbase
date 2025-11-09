import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const hapticFeedback = {
  light: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available on web, silently fail
    }
  },
  
  medium: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available on web, silently fail
    }
  },
  
  heavy: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // Haptics not available on web, silently fail
    }
  },
  
  success: async () => {
    try {
      await Haptics.notification({ type: 'SUCCESS' as any });
    } catch (e) {
      // Haptics not available on web, silently fail
    }
  },
  
  error: async () => {
    try {
      await Haptics.notification({ type: 'ERROR' as any });
    } catch (e) {
      // Haptics not available on web, silently fail
    }
  },
  
  selection: async () => {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (e) {
      // Haptics not available on web, silently fail
    }
  }
};
