import { ChangeEventHandler, FocusEventHandler } from 'react';
import { GlobalError } from './ferdium-components.types';

export interface FormFieldOptions {
  value?: string;
  label?: string;
  disabled?: boolean;
}

export interface FormFields {
  fields: {
    [key: string]: {
      label?: string;
      placeholder?: string;
      options?: FormFieldOptions[];
      value?: string | boolean | number | null;
      default?: string | boolean | number | null;
      type?: string; // todo specifiy probably
      disabled?: boolean;
      validators?: any; // Not sure yet.
    };
  };
}

export interface Field extends Partial<Listeners> {
  id?: string;
  type?: string;
  name?: string;
  value: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: GlobalError | string;
}

export interface Listeners {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
}
