const IS_DEV = import.meta.env.DEV;

export const debug = {
  log: (...args: any[]) => {
    if (IS_DEV) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (IS_DEV) {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  },
  
  time: (label: string) => {
    if (IS_DEV) {
      console.time(label);
    }
  },
  
  timeEnd: (label: string) => {
    if (IS_DEV) {
      console.timeEnd(label);
    }
  },
  
  group: (label: string) => {
    if (IS_DEV) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (IS_DEV) {
      console.groupEnd();
    }
  }
};

export default debug;
