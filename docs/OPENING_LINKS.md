# Opening links in services

Ferdium can act as the desktop app of the services it runs. When another program asks Ferdium to open a link, Ferdium finds the service the link belongs to, shows it and loads the link in it. That covers two kinds of links:

- **http(s) links**, for example a Slack permalink handed to Ferdium by a link router that is set up as the default browser.
- **App links** of a service, for example the `slack://` link that the "Open in app" button on a Slack web page opens.

The work is split in two. Ferdium does the generic part: getting the link to the right window, asking the recipes who owns it, and loading it. Each recipe does the part that only it knows: which links belong to it and what url its web app needs for them.

## How a link travels

1. **The operating system starts Ferdium with the link as an argument.** For app links that only happens when Ferdium is registered as their handler, see [Registering app link protocols](#registering-app-link-protocols). When Ferdium is already running, the new process passes its arguments to the running one and quits without opening a window.
2. **The main process picks the link out of the arguments** (`getExternalUrlFromArgs` in `src/electron/deepLinking.ts`): the first argument that has a scheme, except Ferdium's own `ferdium://` deep links, which are handled as before. It sends the link to the window as `openUrlInService`.
3. **The renderer waits until the services are loaded**, because a link can be what started Ferdium (`ServicesStore._openUrl`).
4. **Ferdium asks the recipe of each displayed service**, in sidebar order, whether the link is its own (`resolveServiceLink` in `src/helpers/open-url-helpers.ts`). The first recipe that returns a url wins. When no recipe claims the link, an http(s) link opens in the first service whose own address has the same host.
5. **Ferdium shows that service and loads the url in its webview.** A hibernated service is woken up first.
6. **When no service matches**, Ferdium tells the user in a dialog and does nothing else. It does not hand the link to the default browser, because a link router may send it straight back to Ferdium.

## What a recipe can do

All of this is optional. A recipe that does nothing keeps working as before, and links to its own host still open in it.

- **`resolveLink(link, context)`** in the recipe's `index.js` decides whether a link belongs to this service. It returns the url the service should load, or `null` when the link isn't its own. `context` holds what Ferdium knows about the service: its `url`, its `team` and its `linkContext`. The base class returns `null`.
- **`Ferdium.setLinkContext({ ... })`** in the recipe's `webview.js` stores details the page knows and Ferdium doesn't, so `resolveLink` can use them later. Ferdium saves them with the service's settings and only when they change.
- **`protocols`** in the recipe's `package.json` lists the app link protocols the recipe handles, for example `["slack"]`. Only list a protocol when `resolveLink` handles its links.

Every service has its own quirks, and they belong in its recipe, not in Ferdium. Slack is an example of all three:

- A `slack://channel?team=T…&id=C…&message=…` link only names the workspace id, while the service only knows its subdomain. The recipe's `webview.js` reads the workspace id from the web client's url (`app.slack.com/client/T…`) and stores it with `setLinkContext`, so `resolveLink` can tell whether an app link is meant for this workspace.
- A permalink to `/archives/…` first shows an "open in the Slack app" page, while the same link to `/messages/…` opens the message in the web client. `resolveLink` rewrites the one into the other.
- `"protocols": ["slack"]` lets Ferdium register for `slack://` links.

## Registering app link protocols

The setting **Open app links in Ferdium** (off by default) registers Ferdium as the handler for the protocols of the recipes of the user's services. It's off by default so Ferdium never takes over links from a native app the user still uses.

Electron can only unregister a protocol handler on Windows and macOS. On Linux the registration stays until the user removes it, for example with `xdg-mime`.

Ferdium registers itself for `ferdium://` regardless of this setting, as before.
