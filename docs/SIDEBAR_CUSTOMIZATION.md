# Sidebar customization

Ferdium's vertical service sidebar can be adjusted without opening Settings.
Right-click an empty part of the sidebar or any service icon to access the
sidebar controls.

## Available controls

- **Sidebar width** selects a width from extremely slim to extremely wide.
- **Display service name under the icon** shows or hides each service name.
- **Service name text size** uses automatic sizing or a fixed size from 10 to
  20 pixels.
- **Use compact service sidebar** reduces spacing between services and uses a
  denser layout.

Icons use consistent edge spacing at every vertical sidebar width. Service
names are limited to one line. If a name does not fit, Ferdium displays an
ellipsis; hover over the service to see the complete name, shorten its custom
name, choose a smaller font, or hide service names.

The utility controls at the bottom of the vertical sidebar start collapsed.
Select the menu control to reveal them. They collapse again when the pointer
leaves the sidebar.

## Development verification

Start Ferdium in development mode:

```sh
pnpm start:all-dev
```

Verify the context menu from both a service icon and empty sidebar space. Test
all sidebar widths with service names enabled and disabled, several font sizes,
the compact layout, unread badges, and the collapsing utility controls.
