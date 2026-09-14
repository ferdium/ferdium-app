# OneChat Chinese Send Guard

This note records the VM 103 WhatsApp hotfix path used for stage 1 validation.

## Source implementation

The maintainable source implementation lives in:

- `src/webview/sendGuard.ts`
- `src/webview/recipe.ts`
- `test/webview/sendGuard.test.ts`

It blocks send attempts when the active draft contains Han characters. It allows
English, numbers, emoji, URLs, email addresses, and Chinese punctuation-only
drafts.

## VM 103 installed Ferdium hotfix

VM 103 was running an installed Ferdium build from:

```text
C:\Users\huic0\AppData\Local\Programs\Ferdium\Ferdium.exe
```

Changing `resources\app.asar` directly failed because Electron checked the asar
integrity. The validated workaround is to install the guard through the WhatsApp
recipe `user.js` file:

```text
C:\Users\huic0\AppData\Roaming\Ferdium\recipes\whatsapp\user.js
```

Install or refresh the hotfix from a PowerShell prompt on that VM:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install-whatsapp-chinese-send-guard.ps1 -RestartFerdium
```

If the repository is not present on the VM, copy only
`scripts\install-whatsapp-chinese-send-guard.ps1` there and run it.

Rollback to the latest backed-up `user.js`:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install-whatsapp-chinese-send-guard.ps1 -RestoreLatestBackup -RestartFerdium
```

## Validation checklist

- `你好` is blocked and shows: `检测到中文，已阻止发送。中文不会发送给客户。`
- `Hello 你好` is blocked.
- `Hello 123 😀 https://example.com a@b.com` sends normally.
- `，。！？` sends normally.
- IME composition Enter should not trigger the blocker until the draft actually
  contains committed Han characters and a send attempt is made.
