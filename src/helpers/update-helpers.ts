export default function updateVersionParse(updateVersion: string): string {
  return updateVersion !== '' ? `?version=${updateVersion}` : '';
}
