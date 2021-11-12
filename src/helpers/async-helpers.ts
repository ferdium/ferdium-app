export function sleep(ms: number = 0) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(r => setTimeout(r, ms));
}
