// PWA Install Prompt Handler
let deferredPrompt: any = null;

export const pwaInstall = {
  // Initialize PWA install prompt
  init: () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install prompt after first successful login
      const hasSeenPrompt = localStorage.getItem('pwa_install_prompted');
      if (!hasSeenPrompt) {
        // Delay to not interrupt login flow
        setTimeout(() => {
          pwaInstall.showPrompt();
        }, 3000);
      }
    });

    // Track when PWA is installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      localStorage.setItem('pwa_installed', 'true');
      deferredPrompt = null;
    });
  },

  // Show install prompt
  showPrompt: async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      localStorage.setItem('pwa_install_prompted', 'true');
      
      if (outcome === 'accepted') {
        console.log('User accepted PWA install');
        return true;
      } else {
        console.log('User dismissed PWA install');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  },

  // Check if app is installed
  isInstalled: (): boolean => {
    return (
      localStorage.getItem('pwa_installed') === 'true' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  },

  // Check if install prompt is available
  canInstall: (): boolean => {
    return !!deferredPrompt && !pwaInstall.isInstalled();
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  pwaInstall.init();
}
