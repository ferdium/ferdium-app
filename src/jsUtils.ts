export const ifUndefined = <T>(
  source: undefined | null | T,
  defaultValue: T,
): T => (source !== undefined && source !== null ? source : defaultValue);

export const convertToJSON = (data: string | any | undefined | null) =>
  data && typeof data === 'string' && data.length > 0 ? JSON.parse(data) : data;

export const cleanseJSObject = (data: any | undefined | null) =>
  JSON.parse(JSON.stringify(data));

export const isEscKeyPress = (keyCode: Number) => keyCode === 27;
