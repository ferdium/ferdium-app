import { Menu } from '@electron/remote';
import { mdiApps, mdiDragVertical } from '@mdi/js';
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
import WorkspaceIcon from '../../../components/ui/WorkspaceIcon';
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
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
    '&:hover $dragHandle': {
      opacity: 1,
    },
  },
  isActiveItem: {
    backgroundColor: theme.workspaces.drawer.listItem.activeBackground,
    '&:hover': {
      backgroundColor: theme.workspaces.drawer.listItem.activeBackground,
    },
  },
  textContent: {
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
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
  dragHandle: {
    opacity: 0,
    transition: 'opacity 150ms',
    cursor: 'grab',
    flexShrink: 0,
    fill: theme.workspaces.drawer.listItem.name.color,
    '&:active': {
      cursor: 'grabbing',
    },
    '&.compact': {
      display: 'none',
    },
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  isActive: boolean;
  name: string;
  iconPath?: string | null;
  onClick: MouseEventHandler<HTMLInputElement>;
  services: string[];
  onContextMenuEditClick?: (() => void) | null;
  shortcutIndex: number;
  isCompact: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

@observer
class WorkspaceDrawerItem extends Component<IProps> {
  static defaultProps = {
    iconPath: null,
    onContextMenuEditClick: null,
    onDragStart: noop,
    onDragOver: noop,
    onDrop: noop,
    draggable: false,
  };

  render(): ReactElement {
    const {
      classes,
      isActive,
      name,
      iconPath,
      onClick,
      onContextMenuEditClick = null,
      services,
      shortcutIndex,
      intl,
      isCompact,
      onDragStart,
      onDragOver,
      onDrop,
      draggable,
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
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        draggable={draggable && !isCompact}
        aria-label={isCompact ? name : undefined}
        data-tooltip-id="tooltip-workspaces-drawer"
        data-tooltip-content={acceleratorString({
          index: shortcutIndex,
          keyCombo: `${cmdOrCtrlShortcutKey(false)}+${altKey(false)}`,
        })}
      >
        {/* Drag handle — only shown on hover in non-compact mode */}
        {!isCompact && shortcutIndex > 0 && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <span
            className={classnames([classes.dragHandle, compactClass])}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            onKeyDown={noop}
          >
            <Icon
              icon={mdiDragVertical}
              size={0.9}
            />
          </span>
        )}

        {/* Compact mode: show icon or initials circle */}
        {isCompact ? (
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
            <WorkspaceIcon
              iconPath={iconPath}
              name={name}
              size={36}
              isActive={isActive}
            />
          )
        ) : (
          <>
            {/* Normal mode: icon on the left if workspace has one (not "All services") */}
            {shortcutIndex > 0 && (
              <WorkspaceIcon
                iconPath={iconPath}
                name={name}
                size={32}
                isActive={isActive}
              />
            )}

            {/* Text content */}
            <div className={classes.textContent}>
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
          </>
        )}
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WorkspaceDrawerItem),
);
