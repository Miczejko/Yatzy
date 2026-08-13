// Short, dictation-friendly room code generator.
// Avoids visually/audibly confusing characters: 0/O, 1/I/L.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 4): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  return /^[A-Z2-9]{3,8}$/.test(code);
}
