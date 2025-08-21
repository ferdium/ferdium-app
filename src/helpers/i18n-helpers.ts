import generatedTranslations from '../i18n/translations';

const locales = generatedTranslations();

export const getLocale = ({ locale, locales, fallbackLocale }) => {
  if (!locale) {
    return fallbackLocale;
  }

  if (!locales[locale]) {
    let localeFuzzy: string | undefined;
    for (const localStr of Object.keys(locales)) {
      if (locale.slice(0, 2) === localStr.slice(0, 2)) {
        localeFuzzy = localStr;
      }
    }

    if (localeFuzzy) {
      return localeFuzzy;
    }
  }

  return locale;
};

export const getTranslatedText = (
  locale: string,
  key: string,
  fallback: string,
  params?: Record<string, string>,
): string => {
  try {
    let text = locales[locale]?.[key] || fallback;

    // Replace parameters in the format {paramName}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replaceAll(`{${paramKey}}`, paramValue);
      });
    }

    return text;
  } catch {
    return fallback;
  }
};

export const getSelectOptions = ({
  locales,
  resetToDefaultText = '',
  automaticDetectionText = '',
  sort = true,
  addDefault = false,
}) => {
  const options: object[] = [];

  if (resetToDefaultText) {
    options.push({
      value: '',
      label: resetToDefaultText,
    });
  }

  if (automaticDetectionText) {
    options.push({
      value: 'automatic',
      label: automaticDetectionText,
    });
  }

  if (addDefault) {
    options.push({
      value: '───',
      label: '───',
      disabled: true,
    });
  }

  let keys = Object.keys(locales);
  if (sort) {
    keys = keys.sort(Intl.Collator().compare);
  }
  for (const key of keys) {
    options.push({
      value: key,
      label: locales[key],
    });
  }

  return options;
};
