export const ifUndefined = <T>(
  source: undefined | null | T,
  defaultValue: T,
): T => (source !== undefined && source !== null ? source : defaultValue);

export const convertToJSON = (data: string | any | undefined | null) =>
  data && typeof data === 'string' && data.length > 0 ? JSON.parse(data) : data;

export const cleanseJSObject = (data: any | undefined | null) =>
  JSON.parse(JSON.stringify(data));

export const isEscKeyPress = (keyCode: number) => keyCode === 27;

export const safeParseInt = (text: string | number | undefined | null) => {
  if (text === undefined || text === null) {
    return 0;
  }

  // Parse number to integer
  // This will correct errors that recipes may introduce, e.g.
  // by sending a String instead of an integer
  const parsedNumber = Number.parseInt(text.toString(), 10);
  const adjustedNumber = Number.isNaN(parsedNumber) ? 0 : parsedNumber;
  return Math.max(adjustedNumber, 0);
};
