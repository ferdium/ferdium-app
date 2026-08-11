import { debounce } from 'lodash';

const DEFAULT_DETECTION_DELAY = 225;

type DebouncedKeyupHandler = ((event: KeyboardEvent) => void) & {
  cancel?: () => void;
};

type AutomaticLanguageDetectionOptions = {
  detectLanguage: (sample: string) => Promise<string | null>;
  getServiceId: () => string;
  resolveSpellcheckerLocale: (locale: string) => string | null;
  switchDictionary: (locale: string, serviceId: string) => void;
  addKeyupListener?: (listener: (event: KeyboardEvent) => void) => void;
  delay?: number;
  removeKeyupListener?: (listener: (event: KeyboardEvent) => void) => void;
};

export default class AutomaticLanguageDetection {
  private readonly addKeyupListener: (
    listener: (event: KeyboardEvent) => void,
  ) => void;

  private readonly delay: number;

  private readonly detectLanguage: (sample: string) => Promise<string | null>;

  private readonly getServiceId: () => string;

  private readonly removeKeyupListener: (
    listener: (event: KeyboardEvent) => void,
  ) => void;

  private readonly resolveSpellcheckerLocale: (locale: string) => string | null;

  private readonly switchDictionary: (
    locale: string,
    serviceId: string,
  ) => void;

  private handler: DebouncedKeyupHandler | null = null;

  private attached = false;

  constructor({
    addKeyupListener = listener => window.addEventListener('keyup', listener),
    delay = DEFAULT_DETECTION_DELAY,
    detectLanguage,
    getServiceId,
    removeKeyupListener = listener =>
      window.removeEventListener('keyup', listener),
    resolveSpellcheckerLocale,
    switchDictionary,
  }: AutomaticLanguageDetectionOptions) {
    this.addKeyupListener = addKeyupListener;
    this.delay = delay;
    this.detectLanguage = detectLanguage;
    this.getServiceId = getServiceId;
    this.removeKeyupListener = removeKeyupListener;
    this.resolveSpellcheckerLocale = resolveSpellcheckerLocale;
    this.switchDictionary = switchDictionary;
  }

  get isAttached(): boolean {
    return this.attached;
  }

  enable(): void {
    if (this.attached) {
      return;
    }

    if (!this.handler) {
      this.handler = debounce(this.detectLanguageFromEvent, this.delay);
    }

    this.addKeyupListener(this.handler);
    this.attached = true;
  }

  disable(): void {
    if (!this.attached || !this.handler) {
      return;
    }

    this.removeKeyupListener(this.handler);
    this.handler.cancel?.();
    this.attached = false;
  }

  destroy(): void {
    this.disable();
    this.handler = null;
  }

  private detectLanguageFromEvent = async (
    event: KeyboardEvent,
  ): Promise<void> => {
    const value = this.getValueFromEvent(event);

    // Force a minimum length to get better detection results
    if (value.length < 25) return;

    const locale = await this.detectLanguage(value);
    if (!locale) {
      return;
    }

    const spellcheckerLocale = this.resolveSpellcheckerLocale(locale);
    if (spellcheckerLocale) {
      this.switchDictionary(spellcheckerLocale, this.getServiceId());
    }
  };

  private getValueFromEvent(event: KeyboardEvent): string {
    const element = event.target as
      | (EventTarget & {
          isContentEditable?: boolean;
          textContent?: string | null;
          value?: string;
        })
      | null;

    if (!element) return '';

    if (element.isContentEditable) {
      return element.textContent ?? '';
    }

    return element.value ?? '';
  }
}
