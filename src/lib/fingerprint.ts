import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprintPromise: Promise<string> | null = null;

export const getFingerprint = async (): Promise<string> => {
  if (!fingerprintPromise) {
    fingerprintPromise = (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
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
