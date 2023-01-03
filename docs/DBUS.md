# D-Bus interface

Ferdium exposes an inter-process communication on Linux systems via [D-Bus](https://www.freedesktop.org/wiki/Software/dbus/).
This allows integrating Ferdium with your desktop environment by displaying the number of unread notifications in a status area and muting or unmuting notations.

## Desktop integration

As an example integration, the [`docs/dbus`](dbus) folder contains a module for the [Waybar](https://github.com/Alexays/Waybar) status bar written in Python.
To run the example, you'll need Python 3.11 and the [`dbus-next`](https://pypi.org/project/dbus-next/) PyPI package.

The integration uses the [`FerdiumClient`](dbus/ferdium_client.py) client library, which is an asynchronous wrapper over the D-Bus interface.
It illustrates multiple advanced concepts, such as asynchronous communication with Ferdium via `asyncio` and polling the session D-Bus to see if Ferdium is running.

The [`ferdium_waybar.py`](dbus/ferdium_waybar.py) implements the Waybar module.
You may pass the following arguments to the script:

* `status`: watches for the status of Ferdium asynchronously. Whenever the status changes, a JSON message conforming to the Waybar [`json` return type](https://github.com/Alexays/Waybar/wiki/Module:-Custom) is printed to the standard output. Use this subcommand to update the text, tooltip, and CSS class of a Waybar module displaying Ferdium unread message counts and muted state. The module will show the overall unread direct message count and the name of the first service with unread messages, while the unread messages for all services are available in the tooltip. The CSS class of the module corresponds to the state of Ferdium as follows:
  * `muted`: Ferdium notifications are muted.
  * `direct`: There is at least one unread direct message.
  * `indirect`: There is at least one unread indirect message, but there are not unread direct messages.
  * `idle`: Ferdium is running, but there are no unread messages.
  * If Ferdium is not running, the text, tooltip, and CSS class are set to empty to completely hide the module.
* `toggle-mute`: toggles the muted state of notifications.
* `toggle-window`: focuses the Ferdium window if not focused, and hides the Ferdium window if not focused. This is equivalent to clicking on the Ferdium tray icon.

The [`waybar.json`](dbus/waybar.json) show a usage example of the Waybar module. Before using it in your config, make sure to adjust the path to the script appropriately (the `ferdium_client.py` library and the `ferdium_waybar.py` Waybar module must be located in the same directory, and `ferdium_waybar.py` must be executable). Left-clicking the module toggles the Ferdium window, while right-clicking it toggle the notification muted state.

The [`waybar.css`](dbus/waybar.css) shows and example of styling the Waybar module with CSS according to the muted and unread state.

## Low-level API

The low-level API exposed over D-Bus is documented in [`org.ferdium.Ferdium.xml](docs/org.ferdium.Ferdium.xml) with standard D-Bus introspection syntax.

Ferdium will take ownership of the bus name `org.ferdium.Ferdium` and expose and object implementing the `org.ferdium.Ferdium` interface at the object path `/org/ferdium`.
