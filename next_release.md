# Next release
Infos about the next release:

## Beta
v5.4.0-beta.5:
- Updated translations
- Remove "&" sign from window menu bar (#65)
- Extend debug information
- Use SSH for submodules
- Move hibernation indicator to bottom left (#129 (comment))
- Add fix for 1.1.1.1 hack (#146)
- Fix darkmode not loading correctly (#158)

## Minor
v5.4.0

### Features
- **Merge Franz 5.4.0**
- **Use Ferdi without an Account**: Simply choose "Use Ferdi without an Account" on the login screen
- **Accent color**: Change Ferdi's accent color
- **Darkmode**: Easily open and edit any service's `darkmode.css` through the new "Open darkmode.css" button
- **Hibernation**: Activate service hibernation to save battery
- **Smaller file size**: Ferdi is now 17% smaller
- **Annoucements**: Always get notified about the latest features of Ferdi
- **Navigation bar**: Add option to always show a service navigation bar

### Minor changes
- Sorting applications in QuickSwitch by last used
- Add info about teams only being available on Franz servers
- Add toggle to disable dark mode on per-service basis
- Add toggle to disable universal Dark Mode
- Improve switching between accounts
- Extend debug information
- Add fix for 1.1.1.1 hack (#146)

### Bug fixes
- Fix universal darkmode for WhatsApp and Threema QR Codes
- Fix darkmode not activating on reload
- Fix disabling/enabling service not correctly reloading webview (#116)
- Remove "&" sign from window menu bar (#65)

### Changes in building Ferdi
- Update Building Node Version
- Use SSH for submodules