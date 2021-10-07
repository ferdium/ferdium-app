export function getLocale({ locale, locales, fallbackLocale }) {
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
}

export function getSelectOptions({
  locales,
  resetToDefaultText = '',
  automaticDetectionText = '',
  sort = true,
}) {
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

  options.push({
    value: '───',
    label: '───',
    disabled: true,
  });

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
}
