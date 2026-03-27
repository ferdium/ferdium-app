export default function sleep(ms: number = 0): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(r => setTimeout(r, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
