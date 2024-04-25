import type { ChangeEventHandler, FocusEventHandler } from 'react';
import type { GlobalError } from './ferdium-components.types';

interface SelectOptions {
  disabled?: boolean;
  label?: string;
  value?: string;
}

interface Listeners {
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onDrop?: (file: File) => void;
}

export interface Field extends Listeners {
  id?: string;
  type?: string; // todo specify probably
  name?: string;
  value?: any;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: GlobalError | string;
  options?: SelectOptions[];
  default?: string | boolean | number | null;
  validators?: any; // Not sure yet.
  set?: (value: any) => void;
  [key: string]: any;
}
export interface FormFields {
  fields: {
    [key: string]: Field;
  };
}
