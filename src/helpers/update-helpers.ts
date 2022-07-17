export function getFerdiumVersion(
  currentLocation: string,
  ferdiumVersion: string,
): string {
  const matches = currentLocation?.match(/version=([^&]*)/);
  if (matches !== null) {
    return `v${matches[1]}`;
  }
  return `v${ferdiumVersion}`;
}

export function updateVersionParse(updateVersion: string): string {
  return updateVersion !== '' ? `?version=${updateVersion}` : '';
}
