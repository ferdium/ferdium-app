import { ferdiumVersion } from '../environment-remote';

export default function updateVersionParse(updateVersion: string): string {
  return updateVersion !== '' ? `?version=${updateVersion}` : '';
}

export function getFerdiumVersion(): string {
  const str = window.location.href;
  const matches = str?.match(/version=([^&]*)/);
  if (matches !== null) {
    return `v${matches[1]}`;
  }
  return `v${ferdiumVersion}`;
}
