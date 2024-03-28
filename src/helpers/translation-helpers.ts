import translateGoogle from 'google-translate-api-x';
import { LIVE_API_FERDIUM_LIBRETRANSLATE } from '../config';

export async function translateTo(
  text: string,
  translateToLanguage: string,
  translatorEngine: string,
): Promise<{ text: string; error: boolean }> {
  const errorText =
    // TODO: Need to support i18n
    'FERDIUM ERROR: An error occurred. Please select less text to translate or try again later.';

  if (translatorEngine === 'Google') {
    const translationResult = await translateGoogle(text, {
      to: translateToLanguage,
      autoCorrect: true,
    })
      .then(res => ({ text: res.text, error: false }))
      .catch(() => ({ text: errorText, error: true }));

    return translationResult;
  }

  if (translatorEngine === 'LibreTranslate') {
    try {
      const res = await fetch(LIVE_API_FERDIUM_LIBRETRANSLATE, {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: translateToLanguage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await res.json();

      return { text: response.translatedText, error: false };
    } catch {
      return { text: errorText, error: true };
    }
  }

  return { text: errorText, error: true };
}
