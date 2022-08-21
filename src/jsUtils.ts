// TODO: ifUndefinedString can be removed after ./src/webview/recipe.js is converted to typescript.
export const ifUndefinedString = (
  source: string | undefined | null,
  defaultValue: string,
): string => (source !== undefined && source !== null ? source : defaultValue);

export const ifUndefined = <T>(
  source: undefined | null | T,
  defaultValue: T,
): T => {
  if (source !== undefined && source !== null) {
    return source;
  }

  return defaultValue;
};

export const convertToJSON = (data: string | any | undefined | null) =>
  data && typeof data === 'string' && data.length > 0 ? JSON.parse(data) : data;

export const cleanseJSObject = (data: any | undefined | null) =>
  JSON.parse(JSON.stringify(data));

export const isEscKeyPress = (keyCode: Number) => keyCode === 27;
