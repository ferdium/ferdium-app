import { Menu } from '@electron/remote';
import { mdiApps } from '@mdi/js';
import classnames from 'classnames';
import type { MenuItemConstructorOptions } from 'electron';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component, type MouseEventHandler, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import Icon from '../../../components/ui/icon';
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
  services: {
    id: 'workspaceDrawer.item.services',
    defaultMessage: 'services',
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
    '&.compact': {
      padding: '0px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: '16px',
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
    '&.compact': {
      marginTop: 0,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
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
    '&.compact': {
      display: 'none',
    },
  },
  activeServices: {
    color: theme.workspaces.drawer.listItem.services.active,
  },
  icon: {
    fill: theme.workspaces.drawer.listItem.name.color,
  },
  activeIcon: {
    fill: theme.workspaces.drawer.listItem.name.activeColor,
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  isActive: boolean;
  name: string;
  onClick: MouseEventHandler<HTMLInputElement>;
  services: string[];
  onContextMenuEditClick?: (() => void) | null;
  shortcutIndex: number;
  isCompact: boolean;
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
      isCompact,
    } = this.props;

    const compactClass = isCompact ? 'compact' : '';

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
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={classnames([
          classes.item,
          isActive ? classes.isActiveItem : null,
          compactClass,
        ])}
        onClick={onClick}
        onContextMenu={() => {
          if (onContextMenuEditClick) {
            contextMenu.popup();
          }
        }}
        onKeyDown={noop}
        aria-label={isCompact ? name : undefined}
        data-tooltip-id="tooltip-workspaces-drawer"
        data-tooltip-content={acceleratorString({
          index: shortcutIndex,
          keyCombo: `${cmdOrCtrlShortcutKey(false)}+${altKey(false)}`,
        })}
      >
        <span
          className={classnames([
            classes.name,
            isActive ? classes.activeName : null,
            compactClass,
          ])}
        >
          {compactClass ? (
            shortcutIndex === 0 ? (
              <Icon
                icon={mdiApps}
                size={1.5}
                className={classnames([
                  classes.icon,
                  isActive ? classes.activeIcon : null,
                ])}
              />
            ) : (
              [...name][0]
            )
          ) : (
            name
          )}
        </span>
        <span
          className={classnames([
            classes.services,
            isActive ? classes.activeServices : null,
            compactClass,
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
