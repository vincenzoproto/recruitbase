// Push Notifications Handler
export const pushNotifications = {
  // Check if push notifications are supported
  isSupported: (): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Request notification permission
  requestPermission: async (): Promise<boolean> => {
    if (!pushNotifications.isSupported()) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        localStorage.setItem('notification_permission', 'granted');
        return true;
      } else {
        console.log('Notification permission denied');
        localStorage.setItem('notification_permission', 'denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  // Subscribe to push notifications
  subscribe: async (): Promise<PushSubscription | null> => {
    if (!pushNotifications.isSupported()) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // VAPID public key - in production, store this in environment variables
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8bYExtWihW0qF4fMRJhLvmWVdtJ0iGPkIOWxj7Qr5PL9hRJVw_5m7o'
        ) as any
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  },

  // Show local notification
  showNotification: async (title: string, options?: NotificationOptions): Promise<void> => {
    if (!pushNotifications.isSupported()) {
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await pushNotifications.requestPermission();
      if (!granted) return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'recruit-base-notification',
        requireInteraction: false,
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  },

  // Get notification permission status
  getPermissionStatus: (): NotificationPermission => {
    if (!pushNotifications.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
