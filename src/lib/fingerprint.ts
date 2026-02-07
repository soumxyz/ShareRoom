import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprintPromise: Promise<string> | null = null;

export const getFingerprint = async (): Promise<string> => {
  // Check localStorage first
  const stored = localStorage.getItem('shareroom_fingerprint');
  if (stored) return stored;

  if (!fingerprintPromise) {
    fingerprintPromise = (async () => {
      let visitorId: string;
      try {
        console.log('Loading FingerprintJS...');
        const fp = await FingerprintJS.load();
        console.log('FingerprintJS loaded, getting result...');
        const result = await fp.get();
        console.log('Fingerprint generated:', result.visitorId);
        visitorId = result.visitorId;
      } catch (error) {
        console.error('Error generating fingerprint:', error);
        // Fallback to a simple random ID if fingerprinting fails
        visitorId = 'fallback_' + Math.random().toString(36).substr(2, 9);
        console.log('Using fallback fingerprint:', visitorId);
      }

      localStorage.setItem('shareroom_fingerprint', visitorId);
      return visitorId;
    })();
  }
  return fingerprintPromise;
};

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
