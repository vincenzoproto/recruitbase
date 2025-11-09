import { supabase } from "@/integrations/supabase/client";

// WebAuthn biometric authentication
export const biometricAuth = {
  // Check if biometric auth is available
  isAvailable: async (): Promise<boolean> => {
    return !!(
      window.PublicKeyCredential &&
      navigator.credentials &&
      typeof navigator.credentials.create === 'function'
    );
  },

  // Register biometric credentials after traditional login
  register: async (userId: string, userName: string): Promise<boolean> => {
    try {
      const available = await biometricAuth.isAvailable();
      if (!available) {
        console.log('Biometric auth not available');
        return false;
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: "Recruit Base TRM",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Use platform authenticators (Touch ID, Face ID)
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "direct"
        },
      };

      const credential = await navigator.credentials.create(
        publicKeyCredentialCreationOptions
      ) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Store credential info in database
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(response.getPublicKey()!)));

      const { error } = await supabase
        .from('biometric_credentials')
        .upsert({
          user_id: userId,
          credential_id: credentialId,
          public_key: publicKey,
          device_name: navigator.userAgent.includes('iPhone') ? 'iPhone' :
                       navigator.userAgent.includes('iPad') ? 'iPad' :
                       navigator.userAgent.includes('Android') ? 'Android' : 'Desktop'
        });

      if (error) {
        console.error('Error storing credential:', error);
        return false;
      }

      // Store locally that biometric is enabled
      localStorage.setItem('biometric_enabled', 'true');
      localStorage.setItem('biometric_user_id', userId);

      return true;
    } catch (error) {
      console.error('Biometric registration error:', error);
      return false;
    }
  },

  // Authenticate using biometrics
  authenticate: async (): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      const available = await biometricAuth.isAvailable();
      if (!available) {
        return { success: false, error: 'Biometric auth not available' };
      }

      const storedUserId = localStorage.getItem('biometric_user_id');
      if (!storedUserId) {
        return { success: false, error: 'No biometric credentials found' };
      }

      // Get stored credential
      const { data: credentials } = await supabase
        .from('biometric_credentials')
        .select('credential_id')
        .eq('user_id', storedUserId)
        .single();

      if (!credentials) {
        return { success: false, error: 'No biometric credentials found' };
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialId = Uint8Array.from(atob(credentials.credential_id), c => c.charCodeAt(0));

      const publicKeyCredentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          allowCredentials: [{
            id: credentialId,
            type: 'public-key',
            transports: ['internal']
          }],
          timeout: 60000,
          userVerification: "required",
          rpId: window.location.hostname,
        },
      };

      const assertion = await navigator.credentials.get(
        publicKeyCredentialRequestOptions
      ) as PublicKeyCredential;

      if (!assertion) {
        return { success: false, error: 'Authentication failed' };
      }

      // Update last used
      await supabase
        .from('biometric_credentials')
        .update({ last_used: new Date().toISOString() })
        .eq('user_id', storedUserId);

      return { success: true, userId: storedUserId };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      // User cancelled
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Autenticazione annullata' };
      }
      
      return { 
        success: false, 
        error: 'Autenticazione non riuscita, riprova o accedi con email' 
      };
    }
  },

  // Check if user has biometric enabled
  isEnabled: (): boolean => {
    return localStorage.getItem('biometric_enabled') === 'true';
  },

  // Remove biometric credentials
  disable: async (userId: string): Promise<void> => {
    await supabase
      .from('biometric_credentials')
      .delete()
      .eq('user_id', userId);

    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('biometric_user_id');
  }
};
