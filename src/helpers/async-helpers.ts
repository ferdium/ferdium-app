export default function sleep(ms: number = 0): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(r => setTimeout(r, ms));
}
