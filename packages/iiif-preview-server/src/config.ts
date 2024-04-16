export const keyLength = 32;
export const partLength = keyLength / 2;
export const updateKeyLength = 64;
export const expirationTtl = 60 * 60 * 24 * 2; // 48-hours

export const encryptedEnabled = false; // Does not work on Deployed workers.
export const rotatingUpdateKey = true; // Disable to have stable edit links.
