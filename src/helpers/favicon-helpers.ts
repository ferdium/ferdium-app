export function getFaviconUrl(url: string, size: number = 128): string {
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${url}`;
}
