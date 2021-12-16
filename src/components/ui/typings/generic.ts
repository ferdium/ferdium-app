export interface IFormField {
  showLabel?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
  noMargin?: boolean;
}

export type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
