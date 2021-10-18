export function sleep(ms: number = 0) {
  return new Promise(r => setTimeout(r, ms));
}
