export const ifUndefinedString = (source: string | undefined | null, defaultValue: string): string => (source !== undefined && source !== null ? source : defaultValue);

export const ifUndefinedBoolean = (source: boolean | undefined | null, defaultValue: boolean): boolean => Boolean(source !== undefined && source !== null ? source : defaultValue);

export const ifUndefinedNumber = (source: number | undefined | null, defaultValue: number): number => Number(source !== undefined && source !== null ? source : defaultValue);

export const convertToJSON = (data: string | any | undefined | null) => data && typeof data === 'string' && data.length > 0 ? JSON.parse(data) : data

export const cleanseJSObject = (data: any | undefined | null) => JSON.parse(JSON.stringify(data))
