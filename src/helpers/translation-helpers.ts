import fetch from 'node-fetch';
import translateGoogle from 'translate-google';

export async function translateTo(
  text: string,
  translateToLanguage: string,
  translateEngine: string,
) {
  const errorText =
    'FERDIUM ERROR: An error occured. Please select less text to translate or try again later.';

  if (translateEngine === 'Google') {
    try {
      const res = await translateGoogle(text, {
        // from: 'en',
        to: translateToLanguage,
      });

      return { text: res, error: false };
    } catch {
      return { text: errorText, error: true };
    }
  } else if (translateEngine === 'LibreTranslate') {
    try {
      const res = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: 'pt',
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
