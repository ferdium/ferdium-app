import { Component, MouseEventHandler, ReactElement } from 'react';
import { observer } from 'mobx-react';
import withStyles, { WithStylesProps } from 'react-jss';
import classnames from 'classnames';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { noop } from 'lodash';
import { Menu } from '@electron/remote';
import { MenuItemConstructorOptions } from 'electron';
import { altKey, cmdOrCtrlShortcutKey } from '../../../environment';
import { acceleratorString } from '../../../jsUtils';

const messages = defineMessages({
  noServicesAddedYet: {
    id: 'workspaceDrawer.item.noServicesAddedYet',
    defaultMessage: 'No services added yet',
  },
  contextMenuEdit: {
    id: 'workspaceDrawer.item.contextMenuEdit',
    defaultMessage: 'edit',
  },
});

const itemTransition = window?.matchMedia(
  '(prefers-reduced-motion: no-preference)',
)
  ? 'background-color 300ms ease-out'
  : 'none';

const styles = theme => ({
  item: {
    height: '67px',
    padding: `15px ${theme.workspaces.drawer.padding}px`,
    borderBottom: `1px solid ${theme.workspaces.drawer.listItem.border}`,
    transition: itemTransition,
    '&:first-child': {
      borderTop: `1px solid ${theme.workspaces.drawer.listItem.border}`,
    },
    '&:hover': {
      backgroundColor: theme.workspaces.drawer.listItem.hoverBackground,
    },
  },
  isActiveItem: {
    backgroundColor: theme.workspaces.drawer.listItem.activeBackground,
    '&:hover': {
      backgroundColor: theme.workspaces.drawer.listItem.activeBackground,
    },
  },
  name: {
    marginTop: '4px',
    color: theme.workspaces.drawer.listItem.name.color,
  },
  activeName: {
    color: theme.workspaces.drawer.listItem.name.activeColor,
  },
  services: {
    display: 'block',
    fontSize: '11px',
    marginTop: '5px',
    color: theme.workspaces.drawer.listItem.services.color,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    lineHeight: '15px',
  },
  activeServices: {
    color: theme.workspaces.drawer.listItem.services.active,
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  isActive: boolean;
  name: string;
  onClick: MouseEventHandler<HTMLInputElement>;
  services: string[];
  onContextMenuEditClick?: (() => void) | null;
  shortcutIndex: number;
}

@observer
class WorkspaceDrawerItem extends Component<IProps> {
  render(): ReactElement {
    const {
      classes,
      isActive,
      name,
      onClick,
      onContextMenuEditClick = null,
      services,
      shortcutIndex,
      intl,
    } = this.props;

    const contextMenuTemplate: MenuItemConstructorOptions[] = [
      {
        label: name,
        enabled: false,
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(messages.contextMenuEdit),
        click: onContextMenuEditClick || noop,
      },
    ];

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

    return (
      <div
        className={classnames([
          classes.item,
          isActive ? classes.isActiveItem : null,
        ])}
        onClick={onClick}
        onContextMenu={() => {
          if (onContextMenuEditClick) {
            contextMenu.popup();
          }
        }}
        onKeyDown={noop}
        data-tooltip-id="tooltip-workspaces-drawer"
        data-tooltip-content={acceleratorString(
          shortcutIndex,
          `${cmdOrCtrlShortcutKey(false)}+${altKey(false)}`,
        )}
      >
        <span
          className={classnames([
            classes.name,
            isActive ? classes.activeName : null,
          ])}
        >
          {name}
        </span>
        <span
          className={classnames([
            classes.services,
            isActive ? classes.activeServices : null,
          ])}
        >
          {services.length > 0
            ? services.join(', ')
            : intl.formatMessage(messages.noServicesAddedYet)}
        </span>
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WorkspaceDrawerItem),
);
