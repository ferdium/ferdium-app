import { File } from 'electron-dl';
import { ChangeEventHandler, FocusEventHandler } from 'react';
import { GlobalError } from './ferdium-components.types';

export interface FormFieldOptions {
  value?: string;
  label?: string;
  disabled?: boolean;
}

export interface FormFields {
  fields: {
    [key: string]: Field;
  };
}

export interface Field extends Listeners {
  id?: string;
  type?: string; // todo specifiy probably
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

export interface SelectOptions {
  disabled?: boolean;
  label?: string;
  value?: string;
}

export interface Listeners {
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onDrop?: (file: File) => void;
}
