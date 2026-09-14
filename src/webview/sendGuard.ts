const editableSelector =
  'textarea, input:not([type]), input[type="text"], input[type="search"], [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]';

const sendControlSelector =
  'button, [role="button"], input[type="submit"], [data-icon], [data-testid], [aria-label], [title]';

const sendHint = /(^|[\s_-])(send|submit|发送)([\s_-]|$)|send|submit|发送/i;

export const containsHan = (text: string): boolean =>
  /\p{Script=Han}/u.test(text);

export const shouldBlockDraft = (text: string): boolean => containsHan(text);

const read = (element: HTMLElement): string =>
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
    ? element.value
    : (element.textContent ?? '');

const editors = (root: Document | ShadowRoot = document): HTMLElement[] => {
  const found = [...root.querySelectorAll<HTMLElement>(editableSelector)];
  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) found.push(...editors(element.shadowRoot));
  }
  return found.filter(element => element.isConnected);
};

const activeEditor = (): HTMLElement | undefined => {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.matches(editableSelector)) {
    return active;
  }
  return undefined;
};

const signatureFor = (element: HTMLElement): string =>
  [
    element.id,
    typeof element.className === 'string' ? element.className : '',
    element.dataset.icon,
    element.dataset.testid,
    element.dataset.e2e,
    element.dataset.test,
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    element.getAttribute('type'),
    element.getAttribute('role'),
  ]
    .filter(Boolean)
    .join(' ');

const isSendControl = (event: Event): boolean =>
  event
    .composedPath()
    .filter((target): target is HTMLElement => target instanceof HTMLElement)
    .some(
      target =>
        target.matches(sendControlSelector) &&
        sendHint.test(signatureFor(target)),
    );

const isSendKey = (event: KeyboardEvent): boolean =>
  event.key === 'Enter' && !event.shiftKey && !event.isComposing;

const isSendAttempt = (event: Event): boolean => {
  if (event.type === 'submit') return true;
  if (event instanceof KeyboardEvent) return isSendKey(event);
  if (event.type === 'beforeinput') {
    const inputEvent = event as InputEvent;
    return inputEvent.inputType === 'insertParagraph';
  }
  return isSendControl(event);
};

const currentHanDraft = (): HTMLElement | undefined => {
  const active = activeEditor();
  if (active && shouldBlockDraft(read(active))) return active;
  return editors().find(element => shouldBlockDraft(read(element)));
};

const showBlockedNotice = () => {
  const notice = document.createElement('div');
  notice.textContent = '检测到中文，已阻止发送。中文不会发送给客户。';
  notice.setAttribute('role', 'status');
  notice.style.cssText =
    'position:fixed;z-index:2147483647;left:50%;bottom:24px;transform:translateX(-50%);max-width:min(420px,calc(100vw - 32px));padding:10px 14px;border-radius:6px;background:#202124;color:#fff;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.24);';
  document.documentElement.append(notice);
  window.setTimeout(() => notice.remove(), 2600);
};

export default function installSendGuard(): () => void {
  let composing = false;
  let lastNotice = 0;

  const blockIfNeeded = (event: Event) => {
    if (
      composing ||
      (event instanceof KeyboardEvent && event.isComposing) ||
      !isSendAttempt(event)
    ) {
      return;
    }

    const draft = currentHanDraft();
    if (!draft) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    draft.focus();

    const now = Date.now();
    if (now - lastNotice > 800) {
      lastNotice = now;
      showBlockedNotice();
    }
  };

  const onCompositionStart = () => {
    composing = true;
  };
  const onCompositionEnd = () => {
    composing = false;
  };

  const blockedEvents = [
    'beforeinput',
    'keydown',
    'keypress',
    'keyup',
    'pointerdown',
    'pointerup',
    'mousedown',
    'mouseup',
    'click',
    'touchstart',
    'touchend',
    'submit',
  ];

  for (const name of blockedEvents) {
    window.addEventListener(name, blockIfNeeded, {
      capture: true,
      passive: false,
    });
  }
  window.addEventListener('compositionstart', onCompositionStart, true);
  window.addEventListener('compositionend', onCompositionEnd, true);

  return () => {
    for (const name of blockedEvents) {
      window.removeEventListener(name, blockIfNeeded, true);
    }
    window.removeEventListener('compositionstart', onCompositionStart, true);
    window.removeEventListener('compositionend', onCompositionEnd, true);
  };
}
