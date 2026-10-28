param(
  [string]$RecipeDir = "$env:APPDATA\Ferdium\recipes\whatsapp",
  [string]$FerdiumExe = "$env:LOCALAPPDATA\Programs\Ferdium\Ferdium.exe",
  [switch]$RestartFerdium,
  [switch]$RestoreLatestBackup
)

$ErrorActionPreference = "Stop"

$userJs = Join-Path $RecipeDir "user.js"

if (-not (Test-Path $RecipeDir)) {
  throw "WhatsApp recipe directory not found: $RecipeDir"
}

if ($RestoreLatestBackup) {
  $backup = Get-ChildItem $RecipeDir -Filter "user.js.bak-*" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $backup) {
    throw "No user.js backup found in $RecipeDir"
  }

  Copy-Item $backup.FullName $userJs -Force
  Write-Host "RESTORED $userJs from $($backup.FullName)"

  if ($RestartFerdium) {
    Stop-Process -Name Ferdium -Force -ErrorAction SilentlyContinue
    Start-Process $FerdiumExe
  }

  exit 0
}

if (Test-Path $userJs) {
  $backup = Join-Path $RecipeDir ("user.js.bak-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
  Copy-Item $userJs $backup
  Write-Host "Backup created: $backup"
}

$guard = @'
module.exports = () => {
  if (window.__onechatChineseSendGuardInstalled) return;
  window.__onechatChineseSendGuardInstalled = true;

  const editableSelector =
    'textarea, input:not([type]), input[type="text"], input[type="search"], [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]';
  const sendHint =
    /(^|[\s_-])(send|submit|发送)([\s_-]|$)|send|submit|发送/i;
  const containsHan = text => /\p{Script=Han}/u.test(text || '');
  const read = element =>
    element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ? element.value
      : element.textContent || '';

  const editors = (root = document) => {
    const found = [...root.querySelectorAll(editableSelector)];
    for (const element of root.querySelectorAll('*')) {
      if (element.shadowRoot) found.push(...editors(element.shadowRoot));
    }
    return found.filter(element => element.isConnected);
  };

  const activeEditor = () => {
    const active = document.activeElement;
    return active instanceof HTMLElement && active.matches(editableSelector)
      ? active
      : undefined;
  };

  const currentHanDraft = () => {
    const active = activeEditor();
    if (active && containsHan(read(active))) return active;
    return editors().find(element => containsHan(read(element)));
  };

  const isSendControl = event =>
    event
      .composedPath()
      .filter(target => target instanceof HTMLElement)
      .some(target => {
        const signature = [
          target.id,
          typeof target.className === 'string' ? target.className : '',
          target.dataset.icon,
          target.dataset.testid,
          target.dataset.e2e,
          target.dataset.test,
          target.getAttribute('aria-label'),
          target.getAttribute('title'),
          target.getAttribute('type'),
          target.getAttribute('role'),
        ]
          .filter(Boolean)
          .join(' ');
        return (
          target.matches(
            'button, [role="button"], input[type="submit"], [data-icon], [data-testid], [aria-label], [title]',
          ) && sendHint.test(signature)
        );
      });

  const isSendAttempt = event => {
    if (event.type === 'submit') return true;
    if (event instanceof KeyboardEvent) {
      return event.key === 'Enter' && !event.shiftKey && !event.isComposing;
    }
    if (event.type === 'beforeinput') {
      return event.inputType === 'insertParagraph';
    }
    return isSendControl(event);
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

  let composing = false;
  let lastNotice = 0;

  const blockIfNeeded = event => {
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

  window.addEventListener(
    'compositionstart',
    () => {
      composing = true;
    },
    true,
  );

  window.addEventListener(
    'compositionend',
    () => {
      composing = false;
    },
    true,
  );
};
'@

Set-Content -LiteralPath $userJs -Value $guard -Encoding UTF8
Write-Host "INSTALLED WhatsApp Chinese send guard: $userJs"

if ($RestartFerdium) {
  Stop-Process -Name Ferdium -Force -ErrorAction SilentlyContinue
  Start-Process $FerdiumExe
  Write-Host "RESTARTED Ferdium: $FerdiumExe"
}
