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
