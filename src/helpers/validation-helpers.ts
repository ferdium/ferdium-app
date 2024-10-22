import { defineMessages } from 'react-intl';
import isEmail from 'validator/lib/isEmail';
import { isValidExternalURL, isValidFileUrl } from './url-helpers';

const messages = defineMessages({
  required: {
    id: 'validation.required',
    defaultMessage: '{field} is required',
  },
  email: {
    id: 'validation.email',
    defaultMessage: '{field} is not valid',
  },
  url: {
    id: 'validation.url',
    defaultMessage: '{field} is not a valid URL',
  },
  minLength: {
    id: 'validation.minLength',
    defaultMessage: '{field} should be at least {length} characters long',
  },
  oneRequired: {
    id: 'validation.oneRequired',
    defaultMessage: 'At least one is required',
  },
});

export const required = ({ field }) => {
  const isValid = field.value.trim() !== '';
  return [
    isValid,
    (window as any).ferdium.intl.formatMessage(messages.required, {
      field: field.label,
    }),
  ];
};

export const email = ({ field }) => {
  const value = field.value.trim();
  const isValid = isEmail(value);
  return [
    isValid,
    (window as any).ferdium.intl.formatMessage(messages.email, {
      field: field.label,
    }),
  ];
};

export const url = ({ field }) => {
  const value = field.value.trim();
  let isValid = true;

  if (value !== '') {
    if (value.startsWith('http')) {
      isValid = isValidExternalURL(value);
    } else if (value.startsWith('file')) {
      isValid = isValidFileUrl(value);
    } else {
      isValid = false;
    }
  }

  return [
    isValid,
    (window as any).ferdium.intl.formatMessage(messages.url, {
      field: field.label,
    }),
  ];
};

export const minLength = (length: number) => {
  return ({ field }) => {
    let isValid = true;
    if (field.touched) {
      isValid = field.value.length >= length;
    }
    return [
      isValid,
      (window as any).ferdium.intl.formatMessage(messages.minLength, {
        field: field.label,
        length,
      }),
    ];
  };
};

export const oneRequired = (targets: string[]) => {
  return ({ field, form }) => {
    const invalidFields = targets.filter(target => form.$(target).value === '');
    return [
      targets.length !== invalidFields.length,
      (window as any).ferdium.intl.formatMessage(messages.required, {
        field: field.label,
      }),
    ];
  };
};
