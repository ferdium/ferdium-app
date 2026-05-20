import { observer } from 'mobx-react';
import type { ReactElement } from 'react';
import { Component } from 'react';
import withStyles, { type WithStylesProps } from 'react-jss';

const styles = theme => ({
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    background: theme.workspaces?.drawer?.listItem?.activeBackground || '#999',
    color: '#fff',
    fontWeight: 600,
    userSelect: 'none',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
});

interface IProps extends WithStylesProps<typeof styles> {
  iconPath?: string | null;
  name: string;
  size?: number;
  isActive?: boolean;
}

@observer
class WorkspaceIcon extends Component<IProps> {
  static defaultProps = {
    iconPath: null,
    size: 32,
    isActive: false,
  };

  render(): ReactElement {
    const { classes, iconPath, name, size } = this.props;

    const initial = name && name.length > 0 ? [...name][0].toUpperCase() : '?';
    const fontSize = Math.round((size || 32) * 0.45);

    return (
      <div
        className={classes.avatar}
        style={{ width: size, height: size, fontSize }}
        aria-label={name}
      >
        {iconPath ? (
          <img
            src={`file://${iconPath}`}
            alt={name}
            className={classes.image}
            onError={e => {
              // If image fails to load, hide it so the initial shows through
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          initial
        )}
      </div>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(WorkspaceIcon);
