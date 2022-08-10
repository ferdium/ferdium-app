import fetch from 'node-fetch';
import translateGoogle from 'translate-google';
import { LIVE_API_FERDIUM_LIBRETRANSLE } from '../config';

export async function translateTo(
  text: string,
  translateToLanguage: string,
  translatorEngine: string,
) {
  const errorText =
    'FERDIUM ERROR: An error occured. Please select less text to translate or try again later.';

  if (translatorEngine === 'Google') {
    try {
      const res = await translateGoogle(text, {
        // from: 'en',
        to: translateToLanguage,
      });

      return { text: res, error: false };
    } catch {
      return { text: errorText, error: true };
    }
  } else if (translatorEngine === 'LibreTranslate') {
    try {
      const res = await fetch(LIVE_API_FERDIUM_LIBRETRANSLE, {
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
